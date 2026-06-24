using Microsoft.AspNetCore.Mvc;
using MySql.Data.MySqlClient;
using BarcTradeAPI.Models;
using System.Collections.Generic;

namespace BarcTradeAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FeedbackController : ControllerBase
    {
        private readonly IConfiguration _config;
        private readonly string _connectionString;

        public FeedbackController(IConfiguration config)
        {
            _config = config;
            _connectionString = _config.GetConnectionString("Default")!;
        }

        [HttpPost]
        public IActionResult Submeter([FromBody] Feedback f)
        {
            using var conn = new MySqlConnection(_connectionString);
            conn.Open();
            var cmd = new MySqlCommand("INSERT INTO Feedback (rating, notes, remetente, destinatario) VALUES (@r, @n, @rem, @dest)", conn);
            cmd.Parameters.AddWithValue("@r", f.rating);
            cmd.Parameters.AddWithValue("@n", f.notes);
            cmd.Parameters.AddWithValue("@rem", f.remetente);
            cmd.Parameters.AddWithValue("@dest", f.destinatario);
            cmd.ExecuteNonQuery();
            return Ok(new { message = "Feedback recebido!" });
        }

        [HttpGet]
        public IActionResult Todos([FromQuery] string? destinatario = null)
        {
            var lista = new List<Feedback>();
            using var conn = new MySqlConnection(_connectionString);
            conn.Open();

            string query = "SELECT * FROM Feedback";
            if (!string.IsNullOrEmpty(destinatario))
            {
                query += " WHERE destinatario = @destinatario";
            }

            var cmd = new MySqlCommand(query, conn);
            if (!string.IsNullOrEmpty(destinatario))
            {
                cmd.Parameters.AddWithValue("@destinatario", destinatario);
            }

            using var reader = cmd.ExecuteReader();
            while (reader.Read())
            {
                lista.Add(new Feedback
                {
                    feedback_id = reader.GetInt32("feedback_id"),
                    rating = reader.GetInt16("rating"),
                    notes = reader.GetString("notes"),
                    remetente = reader.IsDBNull(reader.GetOrdinal("remetente")) ? "" : reader.GetString("remetente"),
                    destinatario = reader.IsDBNull(reader.GetOrdinal("destinatario")) ? "" : reader.GetString("destinatario")
                });
            }
            return Ok(lista);
        }
    }
}