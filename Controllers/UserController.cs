using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.IdentityModel.Tokens;
using MySql.Data.MySqlClient;
using BarcTradeAPI.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace BarcTradeAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly IConfiguration _config;
        private readonly string _connectionString;

        public UserController(IConfiguration config)
        {
            _config = config;
            _connectionString = _config.GetConnectionString("Default")!;
        }

        [HttpPost]
public IActionResult Register([FromBody] User user)
{
    if (user == null || string.IsNullOrEmpty(user.password))
        return BadRequest(new { message = "Password é obrigatória" });

    var hashedPassword = BCrypt.Net.BCrypt.HashPassword(user.password);

    using var conn = new MySqlConnection(_connectionString);
    conn.Open();

    var cmd = new MySqlCommand("INSERT INTO User (name, email, password, birthdate, moderator, postalcode_id) VALUES (@n, @e, @p, @b, @m, @pc)", conn);
    cmd.Parameters.AddWithValue("@n", user.name);
    cmd.Parameters.AddWithValue("@e", user.email);
    cmd.Parameters.AddWithValue("@p", hashedPassword);
    cmd.Parameters.AddWithValue("@b", user.birthdate);
    cmd.Parameters.AddWithValue("@m", user.moderator);
    cmd.Parameters.AddWithValue("@pc", user.postalcode_id);
    cmd.ExecuteNonQuery();

    // 🔑 Obter o ID do utilizador acabado de inserir
    var userId = (int)cmd.LastInsertedId;

    // 🔐 Gerar token JWT
    var key = Encoding.ASCII.GetBytes(_config["Jwt:Key"]!);
    var tokenHandler = new JwtSecurityTokenHandler();
    var tokenDescriptor = new SecurityTokenDescriptor
    {
        Subject = new ClaimsIdentity(new[]
        {
            new Claim(ClaimTypes.Name, user.email),
            new Claim("userId", userId.ToString()),
            new Claim("moderator", user.moderator.ToString())
        }),
        Expires = DateTime.UtcNow.AddHours(3),
        SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
    };

    var token = tokenHandler.CreateToken(tokenDescriptor);
    var tokenString = tokenHandler.WriteToken(token);

    return Ok(new
    {
        message = "Utilizador registado com sucesso!",
        token = tokenString,
        id = userId,
        name = user.name,
        email = user.email,
        moderator = user.moderator
    });
}

        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginModel loginModel)
        {
            if (loginModel == null || string.IsNullOrWhiteSpace(loginModel.Email) || string.IsNullOrWhiteSpace(loginModel.Password))
                return BadRequest(new { message = "Email e senha são obrigatórios." });

            try
            {
                using var conn = new MySqlConnection(_connectionString);
                conn.Open();

                var cmd = new MySqlCommand("SELECT * FROM user WHERE email = @em", conn);
                cmd.Parameters.AddWithValue("@em", loginModel.Email);

                using var reader = cmd.ExecuteReader();
                if (reader.Read())
                {
                    var storedHash = reader.GetString("password");

                    if (BCrypt.Net.BCrypt.Verify(loginModel.Password, storedHash))
                    {
                        var key = Encoding.ASCII.GetBytes(_config["Jwt:Key"]!); // 🔒 guarda no appsettings se quiseres
                        var tokenHandler = new JwtSecurityTokenHandler();
                        var tokenDescriptor = new SecurityTokenDescriptor
                        {
                            Subject = new ClaimsIdentity(new[]
                            {
                                new Claim(ClaimTypes.Name, reader.GetString("email")),
                                new Claim("userId", reader.GetInt32("user_id").ToString()),
                                new Claim("moderator", reader.GetBoolean("moderator").ToString())
                            }),
                            Expires = DateTime.UtcNow.AddMinutes(10),
                            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
                        };
                        var token = tokenHandler.CreateToken(tokenDescriptor);
                        var tokenString = tokenHandler.WriteToken(token);

                        return Ok(new
                        {
                            message = "Login efetuado com sucesso!",
                            token = tokenString,
                            id = reader.GetInt32("user_id"),
                            name = reader.GetString("name"),
                            email = reader.GetString("email"),
                            moderator = reader.GetBoolean("moderator")
                        });
                    }
                }

                return Unauthorized(new { message = "Credenciais inválidas." });
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"[ERRO LOGIN] {ex.Message}");
                return StatusCode(500, new { message = "Erro interno no servidor." });
            }
        }

        [Authorize]
        [HttpGet("me")]
        public IActionResult GetUtilizadorAutenticado()
        {
            var email = User.Identity?.Name;
            var userId = User.Claims.FirstOrDefault(c => c.Type == "userId")?.Value;
            var isMod = User.Claims.FirstOrDefault(c => c.Type == "moderator")?.Value;

            return Ok(new
            {
                email,
                userId,
                moderator = isMod
            });
        }

       [Authorize]
[HttpGet]
public IActionResult GetAll()
{
    var users = new List<User>();
    using var conn = new MySqlConnection(_connectionString);
    conn.Open();
    var cmd = new MySqlCommand("SELECT * FROM User", conn);
    using var reader = cmd.ExecuteReader();
    while (reader.Read())
    {
        var birthdate = reader.IsDBNull(reader.GetOrdinal("birthdate"))
            ? (DateTime?)null
            : reader.GetDateTime("birthdate");

        users.Add(new User
        {
            user_id = reader.GetInt32("user_id"),
            name = reader.GetString("name"),
            email = reader.GetString("email"),
            password = reader.GetString("password"),
            birthdate = birthdate,
            moderator = reader.GetBoolean("moderator"),
            postalcode_id = reader.GetInt32("postalcode_id")
        });
    }

    return Ok(users);
}

        [HttpPost("recuperar-password")]
        public IActionResult Recuperar([FromBody] dynamic dados)
        {
            string email = dados.email;
            return Ok(new { message = "Instruções enviadas para " + email });
        }

        [HttpGet("byNome")]
        public IActionResult GetByNome([FromQuery] string nome)
        {
            if (string.IsNullOrEmpty(nome))
                return BadRequest(new { message = "Nome é obrigatório." });

            using var conn = new MySqlConnection(_connectionString);
            conn.Open();
            var cmd = new MySqlCommand("SELECT name FROM User WHERE name = @n", conn);
            cmd.Parameters.AddWithValue("@n", nome);

            using var reader = cmd.ExecuteReader();
            if (reader.Read())
            {
                return Ok(new { nomeReal = reader.GetString("name") });
            }

            return NotFound(new { message = "Utilizador não encontrado." });
        }
    }

    public class LoginModel
    {
        public required string Email { get; set; }
        public required string Password { get; set; }
    }
}
