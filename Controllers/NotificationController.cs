using Microsoft.AspNetCore.Mvc;
using MySql.Data.MySqlClient;
using System.Collections.Generic;
using Microsoft.Extensions.Configuration;

namespace BarcTradeAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class NotificationController : ControllerBase
    {
        private readonly IConfiguration _config;
        private readonly string _connectionString;

        public NotificationController(IConfiguration config)
        {
            _config = config;
            _connectionString = _config.GetConnectionString("Default")!;
        }

        public class Notification
        {
            public int NotificationId { get; set; }
            public int Type { get; set; }
            public string Message { get; set; } = string.Empty;
            public string Destinatario { get; set; } = string.Empty;
            public bool IsRead { get; set; }
        }

        // GET api/notification/{username}
        [HttpGet("{username}")]
        public IActionResult GetNotificacoes(string username)
        {
            var lista = new List<Notification>();

            using var conn = new MySqlConnection(_connectionString);
            conn.Open();

            var cmd = new MySqlCommand(@"
                SELECT * FROM notification 
                WHERE LOWER(destinatario) = LOWER(@username) AND IsRead = 0 
                ORDER BY notification_id DESC", conn);
            cmd.Parameters.AddWithValue("@username", username.ToLower()); // Garantir lowercase

            using var reader = cmd.ExecuteReader();
            while (reader.Read())
            {
                lista.Add(new Notification
                {
                    NotificationId = reader.GetInt32("notification_id"),
                    Type = reader.GetInt32("type"),
                    Message = reader.GetString("message"),
                    Destinatario = reader.IsDBNull(reader.GetOrdinal("destinatario")) ? "" : reader.GetString(reader.GetOrdinal("destinatario")),
                    IsRead = reader.GetBoolean("IsRead")
                });
            }

            return Ok(lista);
        }

        // POST api/notification
        [HttpPost]
        public IActionResult CriarNotificacao([FromBody] Notification n)
        {
            using var conn = new MySqlConnection(_connectionString);
            conn.Open();

            var cmd = new MySqlCommand(@"
                INSERT INTO notification (type, message, destinatario) 
                VALUES (@type, @message, @destinatario)", conn);
            cmd.Parameters.AddWithValue("@type", n.Type);
            cmd.Parameters.AddWithValue("@message", n.Message);
            cmd.Parameters.AddWithValue("@destinatario", n.Destinatario);

            cmd.ExecuteNonQuery(); // Executar antes de fechar a conexão

            return Ok(new { message = "Notificação enviada com sucesso!" });
        }

        // POST api/notification/marcar-todas-como-lidas/{username}
        [HttpPost("marcar-todas-como-lidas/{username}")]
        public IActionResult MarcarTodasComoLidas(string username)
        {
            using var conn = new MySqlConnection(_connectionString);
            conn.Open();

            username = username.ToLower(); // Garantir minúsculas

            var cmd = new MySqlCommand(@"
                UPDATE notification 
                SET IsRead = 1 
                WHERE destinatario = @username AND IsRead = 0", conn);
            cmd.Parameters.AddWithValue("@username", username);

            int rowsAffected = cmd.ExecuteNonQuery();

            return Ok(new
            {
                message = $"{rowsAffected} notificações marcadas como lidas.",
                username = username
            });
        }
    }
}
