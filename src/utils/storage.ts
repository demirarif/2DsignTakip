import { ProjectData } from '../types';

const STORAGE_KEY = 'projectData';
const COUNTER_KEY = 'recordCounter';

export const getProjectData = (): ProjectData => {
  if (typeof window === 'undefined') return {};
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : {};
};

export const saveProjectData = (data: ProjectData): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const getCounter = (): number => {
  if (typeof window === 'undefined') return 1;
  const counter = localStorage.getItem(COUNTER_KEY);
  return counter ? parseInt(counter) : 1;
};

export const saveCounter = (counter: number): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(COUNTER_KEY, counter.toString());
};
