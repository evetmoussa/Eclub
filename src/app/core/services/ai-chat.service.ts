// ai-chat.service.ts — Talks to the hosted FastAPI chatbot
// (https://omarhamdon-chatbot.hf.space). The deployed schema appears to
// expose a single POST /chat endpoint. We send `{ message }` and accept
// any of `response | reply | answer | message` in the JSON body — that
// way schema tweaks don't break the UI.

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';

const CHATBOT_URL = 'https://omarhamdon-chatbot.hf.space/chat';

interface ChatBotRawResponse {
  response?: string;
  reply?: string;
  answer?: string;
  message?: string;
  // FastAPI default fallback when error:
  detail?: string | { msg: string }[];
}

@Injectable({ providedIn: 'root' })
export class AiChatService {
  private http = inject(HttpClient);

  /** Send a single message, get the bot's reply text. */
  ask(message: string): Observable<string> {
    const body = { message };

    return this.http.post<ChatBotRawResponse>(CHATBOT_URL, body).pipe(
      map(res => this.extractText(res)),
      catchError(err => {
        console.warn('[AiChatService] failed', err);
        return of(
          "Sorry, I couldn't reach my brain right now. Try again in a moment."
        );
      })
    );
  }

  private extractText(res: ChatBotRawResponse | null | undefined): string {
    if (!res) return "I didn't get a response. Please try again.";
    // Most likely fields first.
    return (
      res.response ||
      res.reply ||
      res.answer ||
      (typeof res.message === 'string' ? res.message : '') ||
      (typeof res.detail === 'string' ? res.detail : '') ||
      "I didn't catch that, can you rephrase?"
    );
  }
}
