using Microsoft.AspNetCore.Mvc;
using MySql.Data.MySqlClient;
using BarcTradeAPI.Models;
using System.Collections.Generic;

namespace BarcTradeAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ChatController : ControllerBase
    {
        private readonly IConfiguration _config;
        private readonly string _connectionString;

        public ChatController(IConfiguration config)
        {
            _config = config;
            _connectionString = _config.GetConnectionString("Default")!;
        }

        // GET api/chat/conversa?user1=1&user2=2
        [HttpGet("conversa")]
        public IActionResult ObterMensagens([FromQuery] int user1, [FromQuery] int user2)
        {
            var mensagens = new List<ChatMessage>();

            using var conn = new MySqlConnection(_connectionString);
            conn.Open();

            var cmd = new MySqlCommand(@"
                SELECT * FROM messages
                WHERE (sender = @user1 AND receiver = @user2)
                   OR (sender = @user2 AND receiver = @user1)
                ORDER BY timestamp ASC
            ", conn);

            cmd.Parameters.AddWithValue("@user1", user1);
            cmd.Parameters.AddWithValue("@user2", user2);

            using var reader = cmd.ExecuteReader();
            while (reader.Read())
            {
                mensagens.Add(new ChatMessage
                {
                    MessageId = reader.GetInt32("message_id"),
                    SenderId = reader.GetInt32("sender"),
                    ReceiverId = reader.GetInt32("receiver"),
                    Content = reader.GetString("content"),
                    Timestamp = reader.GetDateTime("timestamp")
                });
            }

            return Ok(mensagens);
        }

        // POST api/chat
        [HttpPost]
        public IActionResult EnviarMensagem([FromBody] ChatMessage mensagem)
        {
            using var conn = new MySqlConnection(_connectionString);
            conn.Open();

            var cmd = new MySqlCommand(@"
                INSERT INTO messages (sender, receiver, content)
                VALUES (@sender, @receiver, @content)
            ", conn);

            cmd.Parameters.AddWithValue("@sender", mensagem.SenderId);
            cmd.Parameters.AddWithValue("@receiver", mensagem.ReceiverId);
            cmd.Parameters.AddWithValue("@content", mensagem.Content);

            cmd.ExecuteNonQuery();

            return Ok(new { message = "Mensagem enviada com sucesso!" });
        }
    }
}
