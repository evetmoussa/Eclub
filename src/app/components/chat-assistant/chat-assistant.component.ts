import { AfterViewChecked, Component, ElementRef, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AiChatService } from '../../core/services/ai-chat.service';

interface Msg {
  id: number;
  text: string;
  who: 'bot' | 'me';
  time: string;
}

@Component({
  selector: 'app-chat-assistant',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-assistant.component.html',
  styleUrls: ['./chat-assistant.component.scss']
})
export class ChatAssistantComponent implements OnInit, AfterViewChecked {
  @ViewChild('feed') feedRef?: ElementRef<HTMLElement>;

  private ai = inject(AiChatService);

  msgs: Msg[] = [];
  draft = '';
  isTyping = false;

  ngOnInit(): void {
    this.msgs.push({
      id: 1,
      who: 'bot',
      text: 'Hello! I am the Smart Sports Assistant. Ask me anything about academies, bookings, schedules, or membership.',
      time: this.now()
    });
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  send(): void {
    const text = this.draft.trim();
    if (!text || this.isTyping) return;

    this.msgs.push({ id: Date.now(), who: 'me', text, time: this.now() });
    this.draft = '';
    this.askBot(text);
  }

  /** Send the user's question to the hosted chatbot and stream back a reply. */
  private askBot(prompt: string): void {
    this.isTyping = true;
    this.ai.ask(prompt).subscribe({
      next: (reply) => {
        this.isTyping = false;
        this.msgs.push({
          id: Date.now() + 1,
          who: 'bot',
          text: reply,
          time: this.now()
        });
      },
      error: () => {
        this.isTyping = false;
        this.msgs.push({
          id: Date.now() + 1,
          who: 'bot',
          text: "I had trouble reaching the server. Please try again.",
          time: this.now()
        });
      }
    });
  }

  private now(): string {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  private scrollToBottom(): void {
    const el = this.feedRef?.nativeElement;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }

  onKey(evt: KeyboardEvent): void {
    if (evt.key === 'Enter' && !evt.shiftKey) {
      evt.preventDefault();
      this.send();
    }
  }
}
