using Microsoft.AspNetCore.Mvc;
using MySql.Data.MySqlClient;
using BarcTradeAPI.Models;
using Microsoft.AspNetCore.Http;
using System.IO;
using System.Data;

namespace BarcTradeAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EventoController : ControllerBase
    {
        private readonly IConfiguration _config;
        private readonly string _connectionString;

        public EventoController(IConfiguration config)
        {
            _config = config;
            _connectionString = _config.GetConnectionString("Default")!;
        }

        [HttpGet]
        public IActionResult GetAll([FromQuery] string? type = null)
        {
            try
            {
                var eventos = BuscarEventos(null, type);
                return Ok(eventos);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ERRO - GET /evento] {ex.Message}");
                return StatusCode(500, new { message = "Erro ao obter os eventos", detalhe = ex.Message });
            }
        }

        [HttpGet("user")]
        public IActionResult GetByUserId([FromQuery] int? userId)
        {
            if (userId == null || userId <= 0)
            {
                return BadRequest(new { message = "Parâmetro 'userId' inválido ou ausente." });
            }

            try
            {
                var eventos = BuscarEventos(userId.Value);
                return Ok(eventos);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ERRO - GET /evento/user] {ex.Message}");
                return StatusCode(500, new { message = "Erro ao obter eventos do utilizador", detalhe = ex.Message });
            }
        }

        private List<Evento> BuscarEventos(int? userId = null, string? type = null)
        {
            var eventos = new List<Evento>();

            using var conn = new MySqlConnection(_connectionString);
            conn.Open();

            var query = @"
                SELECT 
                    p.post_id, p.title, p.description, p.status, p.local,
                    p.creation_date, p.scheduling, p.image_path, p.user_id,
                    u.name
                FROM Post p
                JOIN user u ON p.user_id = u.user_id
                WHERE 1=1";

            if (userId.HasValue)
                query += " AND p.user_id = @uid";

            if (!string.IsNullOrEmpty(type))
                query += " AND p.type = @type";

            var cmd = new MySqlCommand(query, conn);

            if (userId.HasValue)
                cmd.Parameters.AddWithValue("@uid", userId);

            if (!string.IsNullOrEmpty(type))
                cmd.Parameters.AddWithValue("@type", type);

            using var reader = cmd.ExecuteReader();
            while (reader.Read())
            {
                eventos.Add(new Evento
                {
                    PostId = reader.GetInt32("post_id"),
                    Title = reader.IsDBNull("title") ? "Sem título" : reader.GetString("title"),
                    Description = reader.IsDBNull("description") ? "" : reader.GetString("description"),
                    Status = reader.IsDBNull("status") ? "ativo" : reader.GetString("status"),
                    Local = reader.IsDBNull("local") ? "Indefinido" : reader.GetString("local"),
                    CreationDate = reader.IsDBNull("creation_date") || reader.GetDateTime("creation_date") < new DateTime(2000, 1, 1) ? DateTime.Now : reader.GetDateTime("creation_date"),
                    Scheduling = reader.IsDBNull("scheduling") || reader.GetDateTime("scheduling") < new DateTime(2000, 1, 1) ? DateTime.Now : reader.GetDateTime("scheduling"),
                    ImagePath = reader.IsDBNull("image_path") ? null : reader.GetString("image_path"),
                    UserId = reader.GetInt32("user_id"),
                    UserName = reader.IsDBNull("name") ? "Desconhecido" : reader.GetString("name")
                });
            }

            return eventos;
        }

        [HttpPost]
        [RequestSizeLimit(10_000_000)]
        public async Task<IActionResult> Criar([FromForm] EventoUploadModel model)
        {
            try
            {
                Console.WriteLine(">>> TYPE RECEBIDO: " + model.Type);
                using var conn = new MySqlConnection(_connectionString);
                conn.Open();

                var localidadeCmd = new MySqlCommand(@"
                    SELECT pc.localidade
                    FROM user u
                    JOIN postal_code pc ON u.postalcode_id = pc.id_postalcode
                    WHERE u.user_id = @uid", conn);

                localidadeCmd.Parameters.AddWithValue("@uid", model.UserId);
                var localidadeObj = localidadeCmd.ExecuteScalar();
                string? localidade = localidadeObj?.ToString();

                if (string.IsNullOrWhiteSpace(localidade))
                {
                    return BadRequest(new { message = "Utilizador ou localidade não encontrada." });
                }

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

                var insertCmd = new MySqlCommand(@"
                    INSERT INTO Post (title, description, email, status, local, creation_date, scheduling, image_path, user_id, type)
                    VALUES (@t, @d, @e, @s, @l, @c, @sc, @img, @uid, @type)", conn);

                insertCmd.Parameters.AddWithValue("@t", model.Title);
                insertCmd.Parameters.AddWithValue("@d", model.Description);
                insertCmd.Parameters.AddWithValue("@e", model.Email);
                insertCmd.Parameters.AddWithValue("@s", model.Status);
                insertCmd.Parameters.AddWithValue("@l", localidade);
                insertCmd.Parameters.AddWithValue("@c", DateTime.Now);
                insertCmd.Parameters.AddWithValue("@sc", model.Scheduling);
                insertCmd.Parameters.AddWithValue("@img", imagePath ?? (object)DBNull.Value);
                insertCmd.Parameters.AddWithValue("@uid", model.UserId);
                var tipo = model.Type?.ToLower() == "item" ? "item" : "evento";
                insertCmd.Parameters.AddWithValue("@type", tipo);

                insertCmd.ExecuteNonQuery();

                return Ok(new { message = "Evento criado com sucesso!" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ERRO - POST /evento] {ex.Message}");
                return StatusCode(500, new { message = "Erro ao criar evento", detalhe = ex.Message });
            }
        }

       [HttpPut("permitir/{id}")]
public IActionResult PermitirEvento(int id)
{
    try
    {
        using var conn = new MySqlConnection(_connectionString);
        conn.Open();

        var query = "UPDATE Post SET status = 'permitido' WHERE post_id = @id";
        using var cmd = new MySqlCommand(query, conn);
        cmd.Parameters.AddWithValue("@id", id);

        var rows = cmd.ExecuteNonQuery();

        if (rows == 0)
            return NotFound(new { message = "Evento não encontrado." });

        return Ok(new { message = "Evento permitido com sucesso." });
    }
    catch (Exception ex)
    {
        Console.WriteLine($"[ERRO - PUT /evento/permitir/{id}] {ex.Message}");
        return StatusCode(500, new { message = "Erro ao permitir evento.", detalhe = ex.Message });
    }
}


        [HttpPut("{id}")]
        public IActionResult AtualizarEvento(int id, [FromBody] Evento evento)
        {
            try
            {
                using var conn = new MySqlConnection(_connectionString);
                conn.Open();

                var query = @"
                    UPDATE Post SET 
                        title = @title,
                        description = @description,
                        status = @status,
                        local = @local,
                        creation_date = @creationDate,
                        scheduling = @scheduling
                    WHERE post_id = @id";

                using var cmd = new MySqlCommand(query, conn);
                cmd.Parameters.AddWithValue("@title", evento.Title);
                cmd.Parameters.AddWithValue("@description", evento.Description);
                cmd.Parameters.AddWithValue("@status", evento.Status);
                cmd.Parameters.AddWithValue("@local", evento.Local);
                cmd.Parameters.AddWithValue("@creationDate", evento.CreationDate);
                cmd.Parameters.AddWithValue("@scheduling", evento.Scheduling);
                cmd.Parameters.AddWithValue("@id", id);

                var rowsAffected = cmd.ExecuteNonQuery();
                if (rowsAffected == 0)
                {
                    return NotFound(new { message = "Evento não encontrado." });
                }

                return Ok(new { message = "Evento atualizado com sucesso." });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ERRO - PUT /evento/{id}] {ex.Message}");
                return StatusCode(500, new { message = "Erro ao atualizar evento", detalhe = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public IActionResult ApagarEvento(int id)
        {
            try
            {
                using var conn = new MySqlConnection(_connectionString);
                conn.Open();

                var deleteCmd = new MySqlCommand("DELETE FROM Post WHERE post_id = @id", conn);
                deleteCmd.Parameters.AddWithValue("@id", id);

                var rowsAffected = deleteCmd.ExecuteNonQuery();

                if (rowsAffected == 0)
                {
                    return NotFound(new { message = "Evento não encontrado." });
                }

                return Ok(new { message = "Evento removido com sucesso." });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ERRO - DELETE /evento/{id}] {ex.Message}");
                return StatusCode(500, new { message = "Erro ao apagar evento", detalhe = ex.Message });
            }
        }

        public class EventoUploadModel
        {
            [FromForm(Name = "Title")]
            public string Title { get; set; } = string.Empty;

            [FromForm(Name = "Description")]
            public string Description { get; set; } = string.Empty;

            [FromForm(Name = "Email")]
            public string Email { get; set; } = string.Empty;

            [FromForm(Name = "Status")]
            public string Status { get; set; } = string.Empty;

            [FromForm(Name = "Local")]
            public string Local { get; set; } = string.Empty;

            [FromForm(Name = "Scheduling")]
            public DateTime Scheduling { get; set; }

            [FromForm(Name = "Type")]
            public string Type { get; set; } = string.Empty;

            [FromForm(Name = "UserId")]
            public int UserId { get; set; }

            [FromForm(Name = "Foto")]
            public IFormFile? Foto { get; set; }
        }
    }
}