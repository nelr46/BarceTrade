namespace BarcTradeAPI.Models
{
    public class Proposta
    {
        public int participation_id { get; set; }
        public string description { get; set; } = string.Empty;
        public string file { get; set; } = string.Empty;
        public string remetente { get; set; } = string.Empty;
        public string destinatario { get; set; } = string.Empty;
        public string itemParaTroca { get; set; } = string.Empty;
        public string itemProposto { get; set; } = string.Empty;
        public string status { get; set; } = "pendente";
    }
}
