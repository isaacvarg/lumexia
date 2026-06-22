export const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .replace(/%20/g, '-')
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};



