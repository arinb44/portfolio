import { getCollection } from 'astro:content';
import { sortProjects } from './order.ts';

/** Every project sorted by `order`. Fails the build if the featured/order rules are broken. */
export const getProjects = async () => sortProjects(await getCollection('projects'));
