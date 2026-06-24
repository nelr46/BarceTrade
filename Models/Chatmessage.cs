namespace BarcTradeAPI.Models
{
    public class ChatMessage
    {
        public int MessageId { get; set; }
        public int SenderId { get; set; }    // Agora IDs
        public int ReceiverId { get; set; }
        public string Content { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
    }
}
