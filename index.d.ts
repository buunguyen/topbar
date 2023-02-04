export interface BarColors {
  [key: string]: string
}

export interface TopbarConfigOptions {
  autoRun?: boolean
  barThickness?: number
  barColors?: BarColors
  shadowBlur?: number
  shadowColor?: string
  className?: string
}

export interface Topbar {
  config: (options: TopbarConfigOptions) => void
  show: (delay?: number) => void
  progress: (to?: number | string) => number
  hide: () => void
}

declare const topbar: Topbar

export default topbar
