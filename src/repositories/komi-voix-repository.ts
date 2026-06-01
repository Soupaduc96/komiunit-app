import { KomiVoixService } from '@/services/komi-voix/call-service';
import { Contact, CallLog, VoiceMessage } from '@/types/komi-voix';

export class KomiVoixRepository {
  constructor(private userId: string) {}

  getContacts(): Promise<Contact[]> {
    return KomiVoixService.getUserContacts(this.userId);
  }

  addContact(
    contactUserId: string,
    contactName: string,
    contactPhone: string,
    contactAvatar?: string
  ): Promise<Contact> {
    return KomiVoixService.addContact(this.userId, {
      contactUserId,
      contactName,
      contactPhone,
      contactAvatar,
    });
  }

  removeContact(contactId: string): Promise<void> {
    return KomiVoixService.removeContact(contactId);
  }

  getCallLogs(limit?: number): Promise<CallLog[]> {
    return KomiVoixService.getCallLogs(this.userId, limit);
  }

  createCallLog(
    recipientId: string,
    duration: number,
    status: CallLog['status']
  ): Promise<CallLog> {
    return KomiVoixService.createCallLog({
      callerId: this.userId,
      recipientId,
      duration,
      status,
      startedAt: new Date().toISOString(),
      endedAt: new Date().toISOString(),
    });
  }

  sendVoiceMessage(
    recipientId: string,
    audioUrl: string,
    duration: number,
    transcription?: string
  ): Promise<VoiceMessage> {
    return KomiVoixService.sendVoiceMessage({
      senderId: this.userId,
      recipientId,
      audioUrl,
      duration,
      transcription,
    });
  }

  getVoiceMessages(): Promise<VoiceMessage[]> {
    return KomiVoixService.getVoiceMessages(this.userId);
  }

  markVoiceMessageAsRead(messageId: string): Promise<VoiceMessage> {
    return KomiVoixService.markVoiceMessageAsRead(messageId);
  }
}
