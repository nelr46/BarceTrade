namespace BarcTradeAPI.Models
{
    public class Denuncia
    {
        public int report_id { get; set; }
        public int reportUserId { get; set; }
        public int? participationId { get; set; }  // Agora é nullable
        public int status { get; set; }
        public DateTime date_creation { get; set; }
        public string motivo { get; set; } = string.Empty;
        public string descricao { get; set; } = string.Empty;
        public string remetente { get; set; } = string.Empty;
        public string destinatario { get; set; } = string.Empty;

        public int postId { get; set; }


        public string titulo { get; set; } = string.Empty; // <-- novo campo

    }
}
