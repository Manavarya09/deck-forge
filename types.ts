export type InfographicType = 'bar chart' | 'pie chart' | 'timeline' | 'comparison' | 'statistic highlight';

export interface InfographicData {
  title?: string;
  labels?: string[];
  values?: number[];
  value?: string | number;
  unit?: string;
  items?: { title: string; description: string }[];
  years?: string[];
}

export type SlideLayout = 'visual-left' | 'visual-right' | 'data-centric' | 'title-only';

export interface Slide {
  title: string;
  subtitle?: string;
  bullets: string[];
  image_prompt: string;
  layout: SlideLayout;
  infographic?: InfographicType;
  data?: InfographicData;
}

export interface Presentation {
  slides: Slide[];
}
