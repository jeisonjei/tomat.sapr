import { filter, from } from "rxjs";

const f1 = () => 1;
const f2 = () => 2;
const f3 = () => 3;
const f4 = () => 4;
const f5 = () => 5;
const f6 = () => 6;
const f7 = () => 7;
const f8 = () => 8;

const shapes$ = from([f1, f2, f3, f4, f5, f6, f7, f8]).pipe(
    filter(shape => shape()===1 || shape()===2)
);
shapes$.subscribe(console.log);