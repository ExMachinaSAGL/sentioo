export default interface Notification {
  id: string;
  unread: boolean;
  title: string;
  text: string;
  creationTime: Date;
  priority: number;
  type?: string;
}