export const BLUE = '#00A3FF';
export const ORANGE = '#FF8700';
export const GREY = '#8FA7B3';
export const SLATE = '#4D6F80';
export const TEXT = '#4D6F80';
export const TEXT_LIGHT = '#5C8599';
export const BACKGROUND = '#EBF2F5';
export const DIVIDER = '#D3E2E6';

export interface BoxTheme {
    color: string;
    background: string;
    border: string;
}

export const BOX_THEMES: Record<'blue' | 'orange' | 'grey', BoxTheme> = {
    blue: { color: BLUE, background: '#E6F6FF', border: '#B3DAE2' },
    orange: { color: ORANGE, background: '#F2E6D9', border: '#F1BB87' },
    grey: { color: GREY, background: '#D3E2E6', border: '#C4D2D9' },
};
