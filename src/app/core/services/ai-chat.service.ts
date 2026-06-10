import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';

const CHATBOT_URL = 'https://omarhamdon-fitcoachchat.hf.space/chat';

interface ChatBotRawResponse {
  answer?: string;
  response?: string;
  reply?: string;
  message?: string;
  detail?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AiChatService {
  private http = inject(HttpClient);

  ask(message: string): Observable<string> {
    return this.http
      .post<ChatBotRawResponse>(CHATBOT_URL, {
        question: message
      })
      .pipe(
        map(res => this.extractText(res)),
        catchError(err => {
          console.error('ChatBot Error:', err);

          return of(
            "Sorry, I couldn't reach my brain right now. Try again in a moment."
          );
        })
      );
  }

  private extractText(res: ChatBotRawResponse | null | undefined): string {
    if (!res) {
      return "I didn't get a response. Please try again.";
    }

    return (
      res.answer ||
      res.response ||
      res.reply ||
      res.message ||
      res.detail ||
      "I didn't catch that, can you rephrase?"
    );
  }
}