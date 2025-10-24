import type { Presentation, Slide } from '../types';
declare var PptxGenJS: any;

const addSlideContent = (pptx: any, slide: any, slideData: Slide) => {
    const imageUrl = `https://picsum.photos/seed/${slideData.image_prompt.replace(/[^a-zA-Z0-9]/g, '').slice(0, 10)}/1280/720`;

    const textOpts: any = {
      x: 0.75, y: 1.5, w: 4, h: 3.5,
      fontFace: 'Inter', color: '111111', fontSize: 16,
      lineSpacing: 28,
      bullet: { type: 'dot', indent: 24 }
    };
    
    const imageOpts: any = {
      x: 5.25, y: 1.0, w: 4.25, h: 4.0
    };

    switch (slideData.layout) {
        case 'visual-left':
            slide.addText(slideData.bullets.join('\n'), { ...textOpts, x: 5.25 });
            slide.addImage({ path: imageUrl, ...imageOpts, x: 0.5 });
            break;

        case 'visual-right':
            slide.addText(slideData.bullets.join('\n'), { ...textOpts, x: 0.75 });
            slide.addImage({ path: imageUrl, ...imageOpts, x: 5.25 });
            break;

        case 'data-centric':
            if (slideData.infographic === 'bar chart' && slideData.data) {
                slide.addChart(pptx.ChartType.bar, [
                    {
                        name: slideData.data.title || 'Data',
                        labels: slideData.data.labels || [],
                        values: slideData.data.values || []
                    }
                ], { x: 1, y: 1.5, w: 8, h: 3.5, barDir: 'col', showLegend: false, valAxisLabelFormatCode: '#,##0' });
            } else if (slideData.infographic === 'statistic highlight' && slideData.data) {
                 slide.addText(`${slideData.data.value || ''}${slideData.data.unit || ''}`, {
                    x: 0, y: 1.5, w: '100%', h: 2, align: 'center', fontFace: 'Playfair Display', fontSize: 80, bold: true
                 });
                 slide.addText(slideData.data.title || '', {
                    x: 0, y: 3.5, w: '100%', h: 1, align: 'center', fontFace: 'Inter', fontSize: 20, color: '666666'
                 });
            }
            break;
    }
}

export const exportToPptx = (presentation: Presentation, topic: string) => {
  if (typeof PptxGenJS === 'undefined') {
    alert('Presentation library is not loaded. Please refresh the page.');
    return;
  }
  
  const pptx = new PptxGenJS();
  
  pptx.layout = 'LAYOUT_WIDE';

  pptx.defineSlideMaster({
    title: 'TITLE_SLIDE',
    background: { color: 'FFFFFF' },
    objects: [
      {
        'placeholder': {
          options: {
            name: 'title', type: 'title', x: 0.5, y: 2.5, w: 9, h: 1.6,
            fontFace: 'Playfair Display', align: 'center', valign: 'middle',
            color: '000000', fontSize: 44, bold: true,
          },
        },
      },
      {
        'placeholder': {
            options: {
                name: 'subtitle', type: 'body', x: 0.5, y: 4.0, w: 9, h: 1.0,
                fontFace: 'Inter', align: 'center', valign: 'middle',
                color: '333333', fontSize: 20
            }
        }
      }
    ],
  });
  
  pptx.defineSlideMaster({
    title: 'CONTENT_SLIDE',
    background: { color: 'FFFFFF' },
    objects: [
      {
        'placeholder': {
          options: {
            name: 'title', type: 'title', x: 0.5, y: 0.2, w: 9, h: 1.0,
            fontFace: 'Playfair Display', color: '000000', fontSize: 28,
            align: 'left', bold: true,
          },
        },
      },
    ],
  });

  presentation.slides.forEach((slideData) => {
    const slideLayout = slideData.layout === 'title-only' ? 'TITLE_SLIDE' : 'CONTENT_SLIDE';
    const slide = pptx.addSlide({ masterName: slideLayout });
    
    slide.addText(slideData.title, { placeholder: 'title' });
    
    if (slideData.layout === 'title-only' && slideData.subtitle) {
        slide.addText(slideData.subtitle, { placeholder: 'subtitle' });
    }
    
    if (slideData.layout !== 'title-only') {
      addSlideContent(pptx, slide, slideData);
    }
  });

  const fileName = `${topic.replace(/ /g, '_').toLowerCase()}_presentation.pptx`;
  pptx.writeFile({ fileName: fileName });
};
