import {
  Waves,
  Search,
  Flame,
  Wrench,
  ShowerHead,
  UtensilsCrossed,
  AlertTriangle,
  Droplets,
  Sun,
  MapPin,
  ShieldCheck,
  Clock,
  Building2,
  CheckCircle2,
  Filter,
  Gauge,
  MessageCircle,
  Phone,
  FileCheck2,
} from 'lucide-react'

export const iconMap = {
  Waves,
  Search,
  Flame,
  Wrench,
  ShowerHead,
  UtensilsCrossed,
  AlertTriangle,
  Droplets,
  Sun,
  MapPin,
  ShieldCheck,
  Clock,
  Building2,
  CheckCircle2,
  Filter,
  Gauge,
  MessageCircle,
  Phone,
  FileCheck2,
}

export function Icon({ name, ...props }) {
  const Component = iconMap[name] || CheckCircle2
  return <Component {...props} />
}
