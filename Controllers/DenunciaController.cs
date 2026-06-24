using Microsoft.AspNetCore.Mvc;
using MySql.Data.MySqlClient;
using BarcTradeAPI.Models;
using System.Collections.Generic;

namespace BarcTradeAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DenunciaController : ControllerBase
    {
        private readonly IConfiguration _config;
        private readonly string _connectionString;

        public DenunciaController(IConfiguration config)
        {
            _config = config;
            _connectionString = _config.GetConnectionString("Default")!;
        }

        [HttpPost]
        public IActionResult Criar([FromBody] Denuncia d)
        {
            try
            {
                using var conn = new MySqlConnection(_connectionString);
                conn.Open();

                var cmd = new MySqlCommand(@"INSERT INTO Report 
                    (reportUserId, status, date_creation, motivo, descricao, remetente, participationId, destinatario, titulo, postId) 
                    VALUES 
                    (@user, @status, @data, @motivo, @descricao, @remetente, @participationId, @destinatario, @titulo, @postId)", conn);

                cmd.Parameters.AddWithValue("@user", d.reportUserId);
                cmd.Parameters.AddWithValue("@status", d.status);
                cmd.Parameters.AddWithValue("@data", DateTime.Now);
                cmd.Parameters.AddWithValue("@motivo", d.motivo);
                cmd.Parameters.AddWithValue("@descricao", d.descricao);
                cmd.Parameters.AddWithValue("@remetente", d.remetente);
                cmd.Parameters.AddWithValue("@participationId", d.participationId == 0 ? (object)DBNull.Value : d.participationId);
                cmd.Parameters.AddWithValue("@destinatario", d.destinatario);
                cmd.Parameters.AddWithValue("@titulo", d.titulo);
                cmd.Parameters.AddWithValue("@postId", d.postId);

                cmd.ExecuteNonQuery();
                return Ok(new { message = "Denúncia registada com sucesso!" });
            }
            catch (Exception ex)
            {
                Console.WriteLine("❌ ERRO AO INSERIR DENÚNCIA:");
                Console.WriteLine(ex.Message);
                Console.WriteLine(ex.StackTrace);
                return StatusCode(500, new { error = "Erro ao registar denúncia.", detalhe = ex.Message });
            }
        }

        [HttpPut("resolver/{reportId}/{postId}")]
        public IActionResult Resolver(int reportId, int postId)
        {
            try
            {
                using var conn = new MySqlConnection(_connectionString);
                conn.Open();

                var cmd1 = new MySqlCommand("UPDATE Report SET status = 1 WHERE report_id = @rid", conn);
                cmd1.Parameters.AddWithValue("@rid", reportId);
                cmd1.ExecuteNonQuery();

                var cmd2 = new MySqlCommand("UPDATE Post SET status = 'permitido' WHERE post_id = @pid", conn);
                cmd2.Parameters.AddWithValue("@pid", postId);
                cmd2.ExecuteNonQuery();

                return Ok(new { message = "Denúncia resolvida e anúncio permitido." });
            }
            catch (Exception ex)
            {
                Console.WriteLine("❌ ERRO AO ATUALIZAR DENÚNCIA/POST:");
                Console.WriteLine(ex.Message);
                return StatusCode(500, new { error = "Erro ao resolver denúncia.", detalhe = ex.Message });
            }
        }

        [HttpPut("remover-anuncio/{reportId}/{postId}")]
        public IActionResult RecusarAnuncioComDenuncia(int reportId, int postId)
        {
            try
            {
                using var conn = new MySqlConnection(_connectionString);
                conn.Open();

                var cmd1 = new MySqlCommand("UPDATE Post SET status = 'recusado' WHERE post_id = @pid", conn);
                cmd1.Parameters.AddWithValue("@pid", postId);
                cmd1.ExecuteNonQuery();

                var cmd2 = new MySqlCommand("UPDATE Report SET status = 1 WHERE report_id = @rid", conn);
                cmd2.Parameters.AddWithValue("@rid", reportId);
                cmd2.ExecuteNonQuery();

                return Ok(new { message = "Anúncio marcado como recusado e denúncia resolvida." });
            }
            catch (Exception ex)
            {
                Console.WriteLine("❌ ERRO AO REJEITAR ANÚNCIO:");
                Console.WriteLine(ex.Message);
                return StatusCode(500, new { error = "Erro ao rejeitar anúncio.", detalhe = ex.Message });
            }
        }

        [HttpGet]
        public IActionResult Todas()
        {
            var lista = new List<Denuncia>();
            using var conn = new MySqlConnection(_connectionString);
            conn.Open();
            var cmd = new MySqlCommand("SELECT * FROM Report", conn);
            using var reader = cmd.ExecuteReader();
            while (reader.Read())
            {
                lista.Add(new Denuncia
                {
                    report_id = reader.GetInt32("report_id"),
                    reportUserId = reader.GetInt32("reportUserId"),
                    status = reader.GetInt32("status"),
                    date_creation = reader.GetDateTime("date_creation"),
                    motivo = reader["motivo"]?.ToString() ?? string.Empty,
                    descricao = reader["descricao"]?.ToString() ?? string.Empty,
                    remetente = reader["remetente"]?.ToString() ?? string.Empty,
                    participationId = reader.IsDBNull(reader.GetOrdinal("participationId")) ? 0 : reader.GetInt32("participationId"),
                    destinatario = reader["destinatario"]?.ToString() ?? string.Empty,
                    titulo = reader["titulo"]?.ToString() ?? string.Empty,
                    postId = reader.IsDBNull(reader.GetOrdinal("postId")) ? 0 : reader.GetInt32("postId")
                });
            }
            return Ok(lista);
        }

        [HttpGet("destinatario/{nome}")]
        public IActionResult PorDestinatario(string nome)
        {
            var lista = new List<Denuncia>();
            using var conn = new MySqlConnection(_connectionString);
            conn.Open();

            var cmd = new MySqlCommand("SELECT * FROM Report WHERE destinatario = @nome", conn);
            cmd.Parameters.AddWithValue("@nome", nome);

            using var reader = cmd.ExecuteReader();
            while (reader.Read())
            {
                lista.Add(new Denuncia
                {
                    report_id = reader.GetInt32("report_id"),
                    reportUserId = reader.GetInt32("reportUserId"),
                    status = reader.GetInt32("status"),
                    date_creation = reader.GetDateTime("date_creation"),
                    motivo = reader["motivo"]?.ToString() ?? string.Empty,
                    descricao = reader["descricao"]?.ToString() ?? string.Empty,
                    remetente = reader["remetente"]?.ToString() ?? string.Empty,
                    participationId = reader.IsDBNull(reader.GetOrdinal("participationId")) ? 0 : reader.GetInt32("participationId"),
                    destinatario = reader["destinatario"]?.ToString() ?? string.Empty,
                    titulo = reader["titulo"]?.ToString() ?? string.Empty,
                    postId = reader.IsDBNull(reader.GetOrdinal("postId")) ? 0 : reader.GetInt32("postId")
                });
            }

            return Ok(lista);
        }
    }
}
