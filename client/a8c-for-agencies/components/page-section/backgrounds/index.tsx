import Background1Image from './background-1.svg';
import Background10Image from './background-10.svg';
import Background11Image from './background-11.svg';
import Background2Image from './background-2.svg';
import Background3Image from './background-3.svg';
import Background4Image from './background-4.svg';
import Background5Image from './background-5.svg';
import Background6Image from './background-6.svg';
import Background7Image from './background-7.svg';
import Background8Image from './background-8.svg';
import Background9Image from './background-9.svg';

export type SectionBackground = {
	image: string;
	color: string;
	size?: string;
};

export const BackgroundType1: SectionBackground = {
	image: `url(${ Background1Image })`,
	color: '#EBF4FA',
	size: 'auto 100%',
};

export const BackgroundType2: SectionBackground = {
	image: `url(${ Background2Image })`,
	color: '#EBF4FA',
};

export const BackgroundType3: SectionBackground = {
	image: `url(${ Background3Image })`,
	color: '#EBF4FA',
};

export const BackgroundType4: SectionBackground = {
	image: `url(${ Background4Image })`,
	color: '#F5F2F1',
};

export const BackgroundType5: SectionBackground = {
	image: `url(${ Background5Image })`,
	color: '#EBF4FA',
	size: 'auto 100%',
};

export const BackgroundType6: SectionBackground = {
	image: `url(${ Background6Image })`,
	color: '#EBF4FA',
	size: 'auto 100%',
};

export const BackgroundType7: SectionBackground = {
	image: `url(${ Background7Image })`,
	color: '#EBF4FA',
	size: 'auto 100%',
};

export const BackgroundType8: SectionBackground = {
	image: `url(${ Background8Image })`,
	color: '#EBF4FA',
	size: 'auto 100%',
};

export const BackgroundType9: SectionBackground = {
	image: `url(${ Background9Image })`,
	color: '#EBF4FA',
	size: 'auto 100%',
};

export const BackgroundType10: SectionBackground = {
	image: `url(${ Background10Image })`,
	color: '#EBF4FA',
	size: 'auto 100%',
};

export const BackgroundType11: SectionBackground = {
	image: `url(${ Background11Image })`,
	color: '#F5F2F1',
};
