type TopBarOptions = {
    container?: HTMLElement;
    autoRun?: boolean;
    barThickness?: number;
    barColors?: Record<string, string>;
    shadowBlur?: number;
    showShadow?: boolean;
    shadowColor?: string;
    className?: string;
};
declare class Topbar {
    private container;
    private canvas;
    private progressTimerId;
    private autoRun;
    private showing;
    private currentProgress;
    private barThickness;
    private barColors;
    private shadowBlur;
    private shadowColor;
    private className;
    private fadeTimerId;
    private delayTimerId;
    constructor({ container, autoRun, barThickness, barColors, shadowBlur, shadowColor, className, }?: Partial<TopBarOptions>);
    show(delay?: number): void;
    hide(): void;
    progress(to?: number | string): number;
    private hideLoop;
    private loopShow;
    private createCanvas;
    private repaint;
}
declare function config(options: Partial<TopBarOptions>): Topbar;
declare function show(delay?: number): void;
declare function hide(): void;
declare function progress(to?: number | string): number;

export { type TopBarOptions, Topbar, config, hide, progress, show };
