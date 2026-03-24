export interface PublicToilet {
  id: string
  name: string
  lat: number
  lng: number
  address: string
  openHours?: string
  isOpen24h?: boolean
  hasDisabled?: boolean
  maleCount?: number
  femaleCount?: number
  managedBy?: string
}
