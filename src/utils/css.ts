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
    document.documentElement.appendChild(node);
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
    private cssCounter: number = 0;
    public static new(owner: string) {
        return new CSSManager(owner);
    }

    public constructor(private readonly owner: string) { }
    public insert(css: string) {
        this.cssCounter++;
        insertCss(`${ this.owner }-${ this.cssCounter }`, css);
        return this.cssCounter;
    }

    public remove() {
        for(let i: number = 0; i < this.cssCounter; i++) {
            removeCss(`${ this.owner }-${ this.cssCounter }`);
        }
    }

    public update(
        index: number = 0,
        css: string
    ) {
        const cssId = getCssId(`${ this.owner }-${ index }`.toLowerCase());
        const node = document.getElementById(cssId);

        if(node === null) {
            throw new Error('Can not update inserted CSS for owner "' + cssId + '", failed to locate any css with that ID.');
        }

        node.innerHTML = css;
    }
}