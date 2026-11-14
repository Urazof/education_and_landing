// Тип модуля `cloudflare:email` (его даёт среда выполнения Workers; пакет @cloudflare/workers-types в проект не добавляем).
declare module 'cloudflare:email' {
  export class EmailMessage {
    constructor(from: string, to: string, raw: string);
  }
}
