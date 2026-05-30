import { AfterViewInit, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Banner } from '../../core/models/home/home.model';
import { environment } from '../../../environments/environment';

declare const bootstrap: any;

@Component({
  selector: 'app-home-slider',
  standalone: true,
  templateUrl: './home-slider.component.html',
  styleUrls: ['./home-slider.component.scss'],
  imports: [CommonModule]
})
export class HomeSliderComponent implements AfterViewInit {
  @Input() banners: Banner[] = [];

  /** Single fallback hero used when API URL is missing or 404s. */
  private readonly FALLBACK_IMG =
    'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=1600';

  ngAfterViewInit(): void {
    if (typeof bootstrap === 'undefined') return;
    const element = document.querySelector('#adsSlider');
    if (element) {
      // eslint-disable-next-line no-new
      new bootstrap.Carousel(element, { interval: 4500, ride: 'carousel', pause: false });
    }
  }

  bannerImage(url: string | null | undefined): string {
    if (!url) return this.FALLBACK_IMG;
    if (/^https?:\/\//i.test(url)) return url;
    return `${environment.apiBaseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
  }

  /** Swap to fallback image when the original 404s. Avoids infinite loop. */
  onImgError(evt: Event): void {
    const img = evt.target as HTMLImageElement;
    if (img.src !== this.FALLBACK_IMG) {
      img.src = this.FALLBACK_IMG;
    }
  }
}
