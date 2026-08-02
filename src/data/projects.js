import evacuatedTubeSolarGeyser from '../assets/projects/evacuated-tube-solar-geyser.jpeg'
import modernShowerInstallation from '../assets/projects/modern-shower-installation.jpeg'
import residentialProjectDevelopment from '../assets/projects/residential-project-development.jpeg'
import completeBathroomInstallation from '../assets/projects/complete-bathroom-installation.jpeg'
import waterSupplyPipelineInstallation from '../assets/projects/water-supply-pipeline-installation.jpeg'
import residentialConstructionProject from '../assets/projects/residential-construction-project.jpeg'
import geyserSystemInstallation from '../assets/projects/geyser-system-installation.jpeg'
import waterPumpInstallation from '../assets/projects/water-pump-installation.jpeg'
import backupWaterStorageInstallation from '../assets/projects/backup-water-storage-installation.jpeg'
import geyserSolarPanelInstallation from '../assets/projects/geyser-solar-panel-installation.jpeg'
import bathroomPlumbingInstallation from '../assets/projects/bathroom-plumbing-installation.jpeg'
import showerInstallation from '../assets/projects/shower-installation.jpeg'
import backupWaterStorageFiltrationSystem from '../assets/projects/backup-water-storage-filtration-system.jpeg'
import multiUnitSolarWaterHeating from '../assets/projects/multi-unit-solar-water-heating.jpeg'

export const categories = [
  'All',
  'Geyser Installation',
  'Bathroom Renovations',
  'Backup Water Systems',
  'General Projects',
]

// Local fallback dataset - used whenever Supabase is not configured, unreachable,
// or has no rows yet, so the public site always has real project content to show.
export const fallbackProjects = [
  {
    id: 'modern-shower-installation',
    slug: 'modern-shower-installation',
    title: 'Modern Shower Installation',
    category: 'Bathroom Renovations',
    description:
      'A modern rain shower and concealed shower valve installed against premium marble-finish tiling.',
    image_url: modernShowerInstallation,
    alt: 'Modern shower installation with concealed valve by Nape and Sons Plumbing & Projects',
    featured: true,
    display_order: 1,
    focal: 'top',
  },
  {
    id: 'complete-bathroom-installation',
    slug: 'complete-bathroom-plumbing-installation',
    title: 'Complete Bathroom Plumbing Installation',
    category: 'Bathroom Renovations',
    description:
      'A finished bathroom featuring a freestanding bath, toilet and basin with plumbing fully connected.',
    image_url: completeBathroomInstallation,
    alt: 'Completed bathroom plumbing installation with freestanding bath by Nape and Sons Plumbing & Projects',
    featured: true,
    display_order: 2,
  },
  {
    id: 'backup-water-storage-filtration-system',
    slug: 'backup-water-storage-filtration-system',
    title: 'Backup Water Storage & Filtration System',
    category: 'Backup Water Systems',
    description:
      'Multiple water storage tanks connected to a filtration and pump system for backup water supply.',
    image_url: backupWaterStorageFiltrationSystem,
    alt: 'Backup water storage tanks with filtration and pump system installed by Nape and Sons Plumbing & Projects',
    featured: true,
    display_order: 3,
  },
  {
    id: 'multi-unit-solar-water-heating',
    slug: 'multi-unit-solar-water-heating-installation',
    title: 'Multi Unit Solar Water Heating Installation',
    category: 'Geyser Installation',
    description:
      'Multiple solar water heating panels and geyser tanks installed on a residential roof.',
    image_url: multiUnitSolarWaterHeating,
    alt: 'Multiple solar water heating panels and geyser tanks installed by Nape and Sons Plumbing & Projects',
    featured: true,
    display_order: 4,
  },
  {
    id: 'evacuated-tube-solar-geyser',
    slug: 'evacuated-tube-solar-geyser-installation',
    title: 'Evacuated Tube Solar Geyser Installation',
    category: 'Geyser Installation',
    description:
      'A Hi-Tech evacuated tube solar geyser mounted on a tiled roof to support hot water supply.',
    image_url: evacuatedTubeSolarGeyser,
    alt: 'Evacuated tube solar geyser installation on a tiled roof by Nape and Sons Plumbing & Projects',
    featured: true,
    display_order: 5,
    focal: 'top',
  },
  {
    id: 'shower-installation',
    slug: 'shower-installation',
    title: 'Shower Installation',
    category: 'Bathroom Renovations',
    description: 'A tiled shower installation with rain shower head and mosaic floor finish.',
    image_url: showerInstallation,
    alt: 'Tiled shower installation with rain shower head by Nape and Sons Plumbing & Projects',
    featured: true,
    display_order: 6,
    focal: 'top',
  },
  {
    id: 'bathroom-plumbing-installation',
    slug: 'bathroom-plumbing-installation',
    title: 'Bathroom Plumbing Installation',
    category: 'Bathroom Renovations',
    description:
      'A completed bathroom with toilet and frameless glass shower enclosure, fully plumbed.',
    image_url: bathroomPlumbingInstallation,
    alt: 'Bathroom plumbing installation with glass shower enclosure by Nape and Sons Plumbing & Projects',
    featured: false,
    display_order: 7,
  },
  {
    id: 'geyser-system-installation',
    slug: 'geyser-system-installation',
    title: 'Geyser System Installation',
    category: 'Geyser Installation',
    description: 'An electric geyser installed and connected to household plumbing and power.',
    image_url: geyserSystemInstallation,
    alt: 'Electric geyser system installation by Nape and Sons Plumbing & Projects',
    featured: false,
    display_order: 8,
    focal: 'top',
  },
  {
    id: 'geyser-solar-panel-installation',
    slug: 'solar-geyser-installation',
    title: 'Solar Geyser Installation',
    category: 'Geyser Installation',
    description: 'A solar geyser and flat panel collector installed on a tiled roof.',
    image_url: geyserSolarPanelInstallation,
    alt: 'Solar geyser and flat panel installation by Nape and Sons Plumbing & Projects',
    featured: false,
    display_order: 9,
  },
  {
    id: 'water-pump-installation',
    slug: 'water-pump-installation',
    title: 'Water Pump Installation',
    category: 'Backup Water Systems',
    description: 'A water pump installed as part of a backup water supply system.',
    image_url: waterPumpInstallation,
    alt: 'Water pump installation for a backup water system by Nape and Sons Plumbing & Projects',
    featured: false,
    display_order: 10,
  },
  {
    id: 'backup-water-storage-installation',
    slug: 'backup-water-storage-installation',
    title: 'Backup Water Storage Installation',
    category: 'Backup Water Systems',
    description: 'A water storage tank installed and enclosed as part of a backup water system.',
    image_url: backupWaterStorageInstallation,
    alt: 'Backup water storage tank installation by Nape and Sons Plumbing & Projects',
    featured: false,
    display_order: 11,
  },
  {
    id: 'water-supply-pipeline-installation',
    slug: 'water-supply-pipeline-installation',
    title: 'Water Supply Pipeline Installation',
    category: 'Backup Water Systems',
    description:
      'Water supply piping being installed and connected as part of a water system project.',
    image_url: waterSupplyPipelineInstallation,
    alt: 'Water supply pipeline installation by Nape and Sons Plumbing & Projects',
    featured: false,
    display_order: 12,
  },
  {
    id: 'residential-project-development',
    slug: 'residential-project-development',
    title: 'Residential Project Development',
    category: 'General Projects',
    description: 'Concrete slab preparation as part of a residential building project.',
    image_url: residentialProjectDevelopment,
    alt: 'Residential building project development by Nape and Sons Plumbing & Projects',
    featured: false,
    display_order: 13,
  },
  {
    id: 'residential-construction-project',
    slug: 'residential-construction-project',
    title: 'Residential Construction Project',
    category: 'General Projects',
    description: 'Brickwork and plumbing chase work on a residential construction project.',
    image_url: residentialConstructionProject,
    alt: 'Residential construction project by Nape and Sons Plumbing & Projects',
    featured: false,
    display_order: 14,
    focal: 'top',
  },
]
