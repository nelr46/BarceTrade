using Microsoft.AspNetCore.Mvc;
using MySql.Data.MySqlClient;
using BarcTradeAPI.Models;
using Microsoft.AspNetCore.Http;
using System.Collections.Generic;
using System.IO;

namespace BarcTradeAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PropostaController : ControllerBase
    {
        private readonly IConfiguration _config;
        private readonly string _connectionString;

        public PropostaController(IConfiguration config)
        {
            _config = config;
            _connectionString = _config.GetConnectionString("Default")!;
        }

        [HttpPost]
        [RequestSizeLimit(10_000_000)]
        public async Task<IActionResult> Criar([FromForm] PropostaUploadModel model)
        {
            try
            {
                // 🔒 Validação básica
                if (string.IsNullOrWhiteSpace(model.Remetente) ||
                    string.IsNullOrWhiteSpace(model.Destinatario) ||
                    string.IsNullOrWhiteSpace(model.ItemParaTroca) ||
                    string.IsNullOrWhiteSpace(model.ItemProposto))
                {
                    return BadRequest(new { message = "Todos os campos obrigatórios devem estar preenchidos." });
                }

                using var conn = new MySqlConnection(_connectionString);
                conn.Open();

                string? imagePath = null;

                if (model.Foto is { Length: > 0 })
                {
                    var uploadsDir = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
                    Directory.CreateDirectory(uploadsDir);

                    var fileName = $"{Guid.NewGuid()}_{Path.GetFileName(model.Foto.FileName)}";
                    var filePath = Path.Combine(uploadsDir, fileName);

                    await using var stream = new FileStream(filePath, FileMode.Create);
                    await model.Foto.CopyToAsync(stream);

                    imagePath = $"/uploads/{fileName}";
                }

                var cmd = new MySqlCommand(@"
                    INSERT INTO Participation 
                    (description, file, remetente, destinatario, itemParaTroca, itemProposto, status)
                    VALUES 
                    (@desc, @file, @rem, @dest, @ipt, @ipp, @status)", conn);

                cmd.Parameters.Add("@desc", MySqlDbType.Text).Value = model.Description ?? $"{model.ItemParaTroca} ↔ {model.ItemProposto}";
                cmd.Parameters.Add("@file", MySqlDbType.Text).Value = imagePath ?? "";
                cmd.Parameters.Add("@rem", MySqlDbType.VarChar).Value = model.Remetente;
                cmd.Parameters.Add("@dest", MySqlDbType.VarChar).Value = model.Destinatario;
                cmd.Parameters.Add("@ipt", MySqlDbType.VarChar).Value = model.ItemParaTroca;
                cmd.Parameters.Add("@ipp", MySqlDbType.VarChar).Value = model.ItemProposto;
                cmd.Parameters.Add("@status", MySqlDbType.VarChar).Value = model.Status ?? "pendente";

                cmd.ExecuteNonQuery();

                return Ok(new { message = "Proposta enviada com sucesso!" });
            }
            catch (Exception ex)
            {
                Console.WriteLine("[ERRO - POST /proposta]");
                Console.WriteLine(ex.ToString());
                return StatusCode(500, new { message = "Erro ao criar proposta", detalhe = ex.Message });
            }
        }

        [HttpGet]
        public IActionResult Todas()
        {
            var lista = new List<Proposta>();
            using var conn = new MySqlConnection(_connectionString);
            conn.Open();
            var cmd = new MySqlCommand("SELECT * FROM Participation", conn);
            using var reader = cmd.ExecuteReader();
            while (reader.Read())
            {
                // Ignorar propostas com dados essenciais vazios
                var remetente = reader["remetente"]?.ToString() ?? "";
                var destinatario = reader["destinatario"]?.ToString() ?? "";
                var itemParaTroca = reader["itemParaTroca"]?.ToString() ?? "";
                var itemProposto = reader["itemProposto"]?.ToString() ?? "";

                if (string.IsNullOrWhiteSpace(remetente) ||
                    string.IsNullOrWhiteSpace(destinatario) ||
                    string.IsNullOrWhiteSpace(itemParaTroca) ||
                    string.IsNullOrWhiteSpace(itemProposto))
                {
                    continue; // ignora
                }

                lista.Add(new Proposta
                {
                    participation_id = Convert.ToInt32(reader["participation_id"]),
                    description = reader["description"].ToString() ?? "",
                    file = reader["file"].ToString() ?? "",
                    remetente = remetente,
                    destinatario = destinatario,
                    itemParaTroca = itemParaTroca,
                    itemProposto = itemProposto,
                    status = reader["status"]?.ToString() ?? "pendente"
                });
            }
            return Ok(lista);
        }

        [HttpPut("{id}")]
        public IActionResult Atualizar(int id, [FromBody] Proposta p)
        {
            using var conn = new MySqlConnection(_connectionString);
            conn.Open();
            var cmd = new MySqlCommand("UPDATE Participation SET description = @desc, file = @file WHERE participation_id = @id", conn);
            cmd.Parameters.AddWithValue("@desc", p.description);
            cmd.Parameters.AddWithValue("@file", p.file);
            cmd.Parameters.AddWithValue("@id", id);
            cmd.ExecuteNonQuery();
            return Ok(new { message = "Proposta atualizada!" });
        }

        public class AtualizarEstadoModel
        {
            public string Estado { get; set; } = string.Empty;
        }

        [HttpPut("{id}/estado")]
        public IActionResult AtualizarEstado(int id, [FromBody] AtualizarEstadoModel body)
        {
            try
            {
                using var conn = new MySqlConnection(_connectionString);
                conn.Open();

                var updateCmd = new MySqlCommand("UPDATE Participation SET status = @estado WHERE participation_id = @id", conn);
                updateCmd.Parameters.AddWithValue("@estado", body.Estado);
                updateCmd.Parameters.AddWithValue("@id", id);
                var rows = updateCmd.ExecuteNonQuery();

                if (rows == 0)
                    return NotFound(new { message = "Proposta não encontrada" });

                var selectCmd = new MySqlCommand("SELECT remetente, itemParaTroca, itemProposto FROM Participation WHERE participation_id = @id", conn);
                selectCmd.Parameters.AddWithValue("@id", id);
                using var reader = selectCmd.ExecuteReader();
                if (!reader.Read()) return NotFound(new { message = "Dados da proposta não encontrados" });

                var remetente = reader["remetente"]?.ToString();
                var itemTroca = reader["itemParaTroca"]?.ToString();
                var itemProposto = reader["itemProposto"]?.ToString();
                reader.Close();

                if (string.IsNullOrWhiteSpace(remetente))
                {
                    Console.WriteLine("❌ Remetente da proposta está vazio.");
                    return Ok(new { message = "Estado atualizado, mas notificação não enviada." });
                }

                try
                {
                    var mensagem = $"A tua proposta '{itemTroca} ↔ {itemProposto}' foi {body.Estado}.";
                    var insertNotif = new MySqlCommand("INSERT INTO notification (type, message, destinatario) VALUES (@type, @msg, @dest)", conn);
                    insertNotif.Parameters.AddWithValue("@type", 1);
                    insertNotif.Parameters.AddWithValue("@msg", mensagem);
                    insertNotif.Parameters.AddWithValue("@dest", remetente);
                    insertNotif.ExecuteNonQuery();
                }
                catch (Exception ex)
                {
                    Console.WriteLine("Erro ao inserir notificação: " + ex.Message);
                }

                return Ok(new { message = "Estado atualizado e notificação enviada (se aplicável)." });
            }
            catch (Exception ex)
            {
                Console.WriteLine("Erro ao atualizar estado: " + ex.Message);
                return StatusCode(500, new { message = "Erro interno", detalhe = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public IActionResult Eliminar(int id)
        {
            try
            {
                using var conn = new MySqlConnection(_connectionString);
                conn.Open();

                var cmd = new MySqlCommand("DELETE FROM Participation WHERE participation_id = @id", conn);
                cmd.Parameters.AddWithValue("@id", id);
                var rows = cmd.ExecuteNonQuery();

                if (rows == 0)
                    return NotFound(new { message = "Proposta não encontrada." });

                return Ok(new { message = "Proposta eliminada com sucesso." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Erro interno", detalhe = ex.Message });
            }
        }

        public class PropostaUploadModel
        {
            public string Description { get; set; } = string.Empty;
            public string Remetente { get; set; } = string.Empty;
            public string Destinatario { get; set; } = string.Empty;
            public string ItemParaTroca { get; set; } = string.Empty;
            public string ItemProposto { get; set; } = string.Empty;
            public string Status { get; set; } = "pendente";
            public IFormFile? Foto { get; set; }
        }
    }
}
