namespace BarcTradeAPI.Models
{
    public class Feedback
    {
        public int feedback_id { get; set; }
        public int rating { get; set; }
        public required string notes { get; set; }
        public string remetente { get; set; } = string.Empty;
        public string destinatario { get; set; } = string.Empty;
    }
}
