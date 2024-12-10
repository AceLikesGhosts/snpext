import pkg from './pkg';

export const getCssId = (owner: string) => `${ pkg.name }-css-${ owner }`;

export function insertCss(
    owner: string,
    css: string
) {
    const cssId = getCssId(owner.toLowerCase());

    if(document.getElementById(cssId) !== null) {
        throw new Error('An owner can only insert one CSS element per, this is to reduce on inserted elements; Expected "' + owner.toLowerCase() + '" to have 0 elements but instead found 1.');
    }

    const node = document.createElement('style');
    node.innerHTML = css;
    node.id = cssId;
    node.type = 'text/css';
    document.head.appendChild(node);
}

export function removeCss(owner: string) {
    const cssId = getCssId(owner.toLowerCase());

    const node = document.getElementById(cssId);
    if(node === null) {
        throw new Error('Can not remove inserted CSS for owner "' + owner.toLowerCase() + '", failed to locate any css with ID: "' + cssId + '".');
    }

    node.remove();
}

export default class CSSManager {
    public static new(owner: string) {
        return new CSSManager(owner);
    }

    public constructor(private readonly owner: string) { }
    public insert(css: string) {
        return insertCss(this.owner, css);
    }

    public remove() {
        return removeCss(this.owner);
    }
}