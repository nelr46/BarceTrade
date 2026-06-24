namespace BarcTradeAPI.Models
{
    public class Evento
    {
        public int PostId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string Local { get; set; } = string.Empty;
        public DateTime CreationDate { get; set; }
        public DateTime Scheduling { get; set; }
        public string? ImagePath { get; set; }
        public int UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
    }
}
