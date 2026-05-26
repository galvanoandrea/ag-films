export type Category = 'sport' | 'street' | 'drone'
export type OrderStatus = 'pending' | 'completed' | 'failed'

export interface Event {
  id: string
  slug: string
  name: string
  date: string
  date_label: string
  location: string
  category: Category
  created_at: string
}

export interface Photo {
  id: string
  title: string
  location: string
  category: Category
  event_id: string | null
  price: number // cents
  storage_path_watermarked: string
  storage_path_original: string
  published: boolean
  created_at: string
  events?: Event | null
}

export interface PhotoWithUrl extends Photo {
  watermarked_url: string
}

export interface Order {
  id: string
  photo_id: string
  stripe_session_id: string
  stripe_payment_intent_id: string | null
  amount: number
  customer_email: string | null
  status: OrderStatus
  download_token: string | null
  download_expires_at: string | null
  created_at: string
  photos?: Photo
}

// Supabase-compatible Database type
export type Database = {
  public: {
    Tables: {
      events: {
        Row: Omit<Event, 'category'> & { category: string }
        Insert: Omit<Omit<Event, 'category'> & { category: string }, 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Omit<Omit<Event, 'category'> & { category: string }, 'id' | 'created_at'>>
        Relationships: []
      }
      photos: {
        Row: Omit<Photo, 'events'>
        Insert: Omit<Omit<Photo, 'events'>, 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<Omit<Omit<Photo, 'events'>, 'id' | 'created_at'>>
        Relationships: [
          {
            foreignKeyName: 'photos_event_id_fkey'
            columns: ['event_id']
            isOneToOne: false
            referencedRelation: 'events'
            referencedColumns: ['id']
          },
        ]
      }
      orders: {
        Row: Omit<Order, 'photos'>
        Insert: Omit<Omit<Order, 'photos'>, 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<Omit<Omit<Order, 'photos'>, 'id' | 'created_at'>>
        Relationships: [
          {
            foreignKeyName: 'orders_photo_id_fkey'
            columns: ['photo_id']
            isOneToOne: false
            referencedRelation: 'photos'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: Record<never, never>
    Functions: Record<never, never>
    Enums: Record<never, never>
    CompositeTypes: Record<never, never>
  }
}
