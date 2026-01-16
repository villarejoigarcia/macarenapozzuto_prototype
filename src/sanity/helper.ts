import { createImageUrlBuilder } from '@sanity/image-url';
import { client } from './client';

export const urlFor = (source: any) => createImageUrlBuilder(client).image(source);