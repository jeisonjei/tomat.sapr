class MagnetState{
    constructor(name, point) {
        this.name = name;
        this.point = {...point};
    }
}
export function ms(name, point) {
    return new MagnetState(name, point);
}