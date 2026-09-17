export interface ThemeConfig {
  primaryColor: string;
  accentColor: string;
  bgLight: string;
  bgDark: string;
  bgCard: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  headingFont: string;
  bodyFont: string;
  borderRadius: number;
}

export const SAGE_GREEN_GLOBAL_STYLES = {
  "bgColor": "#f5f0e8",
  "padding": "0px",
  "margin": "0px",
  "fontFamily": "Cormorant Garamond"
};

export const SAGE_GREEN_NODES = [
  {
    "id": "sage_green-container-cover",
    "type": "container",
    "sectionType": "cover",
    "label": "cover",
    "style": {
      "display": "flex",
      "flexDirection": "column",
      "alignItems": "center",
      "gap": 16,
      "padding": "32px 20px",
      "backgroundColor": "#f5f0e8",
      "width": "100%",
      "margin": "0"
    },
    "children": [
      {
        "id": "sage_green-container-cover-title",
        "type": "heading",
        "content": "THE WEDDING OF",
        "style": {
          "fontFamily": "Cormorant Garamond",
          "color": "#1e293b",
          "fontSize": 32,
          "textAlign": "center"
        }
      },
      {
        "id": "sage_green-container-cover-btn",
        "type": "button",
        "content": "Buka Undangan",
        "buttonAction": "open-invitation",
        "style": {
          "backgroundColor": "#6b7c5e",
          "color": "#ffffff",
          "borderRadius": 20,
          "padding": "12px 24px",
          "fontFamily": "Lora"
        }
      }
    ]
  },
  {
    "id": "sage_green-container-hero",
    "type": "container",
    "sectionType": "hero",
    "label": "hero",
    "style": {
      "display": "flex",
      "flexDirection": "column",
      "alignItems": "center",
      "gap": 16,
      "padding": "32px 20px",
      "backgroundColor": "#f5f0e8",
      "width": "100%",
      "margin": "0"
    },
    "children": [
      {
        "id": "sage_green-container-hero-title",
        "type": "heading",
        "content": "Kami Mengundang Anda",
        "style": {
          "fontFamily": "Cormorant Garamond",
          "color": "#1e293b",
          "fontSize": 24,
          "textAlign": "center"
        }
      }
    ]
  },
  {
    "id": "sage_green-container-opening",
    "type": "container",
    "sectionType": "opening",
    "label": "opening",
    "style": {
      "display": "flex",
      "flexDirection": "column",
      "alignItems": "center",
      "gap": 16,
      "padding": "32px 20px",
      "backgroundColor": "#f5f0e8",
      "width": "100%",
      "margin": "0"
    },
    "children": [
      {
        "id": "sage_green-container-opening-verse",
        "type": "text",
        "content": "\"Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri...\" (QS. Ar-Rum: 21)",
        "style": {
          "fontFamily": "Lora",
          "color": "#64748b",
          "fontSize": 16,
          "textAlign": "center",
          "fontStyle": "italic"
        }
      }
    ]
  },
  {
    "id": "sage_green-container-bride_groom",
    "type": "container",
    "sectionType": "bride_groom",
    "label": "Mempelai",
    "style": {
      "display": "flex",
      "flexDirection": "column",
      "alignItems": "center",
      "gap": 16,
      "padding": "32px 20px",
      "backgroundColor": "#f5f0e8",
      "width": "100%",
      "margin": "0"
    },
    "children": [
      {
        "id": "sage_green-container-bride_groom-vars",
        "type": "text",
        "content": "{nama_pria} & {nama_wanita}",
        "style": {
          "fontFamily": "Cormorant Garamond",
          "color": "#b8860b",
          "fontSize": 24,
          "textAlign": "center"
        }
      }
    ]
  },
  {
    "id": "sage_green-container-event_schedule",
    "type": "container",
    "sectionType": "event_schedule",
    "label": "event_schedule",
    "style": {
      "display": "flex",
      "flexDirection": "column",
      "alignItems": "center",
      "gap": 16,
      "padding": "32px 20px",
      "backgroundColor": "#f5f0e8",
      "width": "100%",
      "margin": "0"
    },
    "children": [
      {
        "id": "sage_green-heading-schedule",
        "type": "heading",
        "content": "Rangkaian Acara",
        "style": {
          "fontFamily": "Cormorant Garamond",
          "color": "#1e293b",
          "fontSize": 24,
          "textAlign": "center"
        }
      },
      {
        "id": "sage_green-container-event_schedule-feed",
        "type": "container",
        "isEventFeed": true,
        "label": "Daftar Jadwal Acara",
        "style": {
          "display": "flex",
          "flexDirection": "column",
          "gap": 16,
          "width": "100%"
        },
        "children": [
          {
            "id": "sage_green-card-event-master",
            "type": "container",
            "label": "Kartu Master Acara",
            "style": {
              "display": "flex",
              "flexDirection": "column",
              "alignItems": "center",
              "gap": 10,
              "padding": "24px 20px",
              "backgroundColor": "#ffffff",
              "borderRadius": 20,
              "borderStyle": "solid",
              "borderWidth": 1,
              "borderColor": "#e2e8f0",
              "boxShadow": "0 4px 16px rgba(0,0,0,0.04)",
              "width": "100%"
            },
            "children": [
              {
                "id": "sage_green-event-title",
                "type": "heading",
                "content": "{{event_title}}",
                "style": {
                  "fontSize": 20,
                  "color": "#1e293b",
                  "fontWeight": "bold",
                  "fontFamily": "Cormorant Garamond",
                  "textAlign": "center"
                }
              },
              {
                "id": "sage_green-event-datetime",
                "type": "text",
                "content": "📅 {{event_date}} • 🕘 {{event_time}}",
                "style": {
                  "fontSize": 13,
                  "color": "#6b7c5e",
                  "fontWeight": "bold",
                  "fontFamily": "Lora",
                  "textAlign": "center"
                }
              },
              {
                "id": "sage_green-event-location",
                "type": "text",
                "content": "📍 {{event_location}}",
                "style": {
                  "fontSize": 14,
                  "color": "#334155",
                  "fontWeight": "bold",
                  "fontFamily": "Lora",
                  "textAlign": "center"
                }
              },
              {
                "id": "sage_green-event-address",
                "type": "text",
                "content": "{{event_address}}",
                "style": {
                  "fontSize": 12,
                  "color": "#64748b",
                  "fontFamily": "Lora",
                  "textAlign": "center"
                }
              },
              {
                "id": "sage_green-event-btn-map",
                "type": "button",
                "content": "🗺️ Buka Google Maps",
                "buttonAction": "google-maps",
                "style": {
                  "backgroundColor": "#6b7c5e",
                  "color": "#ffffff",
                  "borderRadius": 20,
                  "padding": "8px 20px",
                  "fontSize": 12,
                  "fontWeight": "bold",
                  "fontFamily": "Lora"
                }
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "sage_green-container-live_streaming",
    "type": "container",
    "sectionType": "live_streaming",
    "label": "live_streaming",
    "style": {
      "display": "flex",
      "flexDirection": "column",
      "alignItems": "center",
      "gap": 16,
      "padding": "32px 20px",
      "backgroundColor": "#f5f0e8",
      "width": "100%",
      "margin": "0"
    },
    "children": [
      {
        "id": "sage_green-container-live_streaming-title",
        "type": "heading",
        "content": "Live Streaming",
        "style": {
          "fontFamily": "Cormorant Garamond",
          "color": "#1e293b",
          "fontSize": 20,
          "textAlign": "center"
        }
      }
    ]
  },
  {
    "id": "sage_green-container-love_story",
    "type": "container",
    "sectionType": "love_story",
    "label": "love_story",
    "style": {
      "display": "flex",
      "flexDirection": "column",
      "alignItems": "center",
      "gap": 16,
      "padding": "32px 20px",
      "backgroundColor": "#f5f0e8",
      "width": "100%",
      "margin": "0"
    },
    "children": [
      {
        "id": "sage_green-container-love_story-title",
        "type": "heading",
        "content": "Kisah Perjalanan Cinta",
        "style": {
          "fontFamily": "Cormorant Garamond",
          "color": "#4a5d4e",
          "fontSize": 24,
          "textAlign": "center"
        }
      },
      {
        "id": "sage_green-container-love_story-feed",
        "type": "container",
        "isStoryFeed": true,
        "label": "Daftar Kisah Cinta",
        "style": {
          "display": "flex",
          "flexDirection": "column",
          "gap": 16,
          "width": "100%"
        },
        "children": [
          {
            "id": "sage_green-card-story-master",
            "type": "container",
            "label": "Kartu Master Cerita",
            "style": {
              "display": "flex",
              "flexDirection": "column",
              "alignItems": "center",
              "gap": 10,
              "padding": "24px 20px",
              "backgroundColor": "#ffffff",
              "borderRadius": 20,
              "borderStyle": "solid",
              "borderWidth": 1,
              "borderColor": "#e2ded6",
              "boxShadow": "0 4px 16px rgba(74,93,78,0.06)",
              "width": "100%"
            },
            "children": [
              {
                "id": "sage_green-story-badge",
                "type": "text",
                "content": "📅 {story_year}",
                "style": {
                  "fontSize": 12,
                  "color": "#4a5d4e",
                  "fontWeight": "bold",
                  "fontFamily": "Inter",
                  "backgroundColor": "#e8efe9",
                  "padding": "4px 14px",
                  "borderRadius": 20,
                  "textAlign": "center"
                }
              },
              {
                "id": "sage_green-story-title",
                "type": "heading",
                "content": "{story_title}",
                "style": {
                  "fontSize": 18,
                  "color": "#2c3e30",
                  "fontWeight": "bold",
                  "fontFamily": "Cormorant Garamond",
                  "textAlign": "center"
                }
              },
              {
                "id": "sage_green-story-desc",
                "type": "text",
                "content": "{story_description}",
                "style": {
                  "fontSize": 13,
                  "color": "#5c6b5e",
                  "fontFamily": "Inter",
                  "textAlign": "center",
                  "lineHeight": "1.6"
                }
              },
              {
                "id": "sage_green-story-img",
                "type": "image",
                "content": "{story_image}",
                "style": {
                  "width": "100%",
                  "height": "200px",
                  "borderRadius": 12,
                  "objectFit": "cover",
                  "margin": "8px 0px 0px 0px"
                }
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "sage_green-container-gallery",
    "type": "container",
    "sectionType": "gallery",
    "label": "gallery",
    "style": {
      "display": "flex",
      "flexDirection": "column",
      "alignItems": "center",
      "gap": 16,
      "padding": "32px 20px",
      "backgroundColor": "#f5f0e8",
      "width": "100%",
      "margin": "0"
    },
    "children": [
      {
        "id": "sage_green-heading-gallery",
        "type": "heading",
        "content": "Galeri Momen Bahagia",
        "style": {
          "fontFamily": "Cormorant Garamond",
          "color": "#4a5d4e",
          "fontSize": 24,
          "textAlign": "center"
        }
      },
      {
        "id": "sage_green-feed-gallery",
        "type": "container",
        "isGalleryFeed": true,
        "label": "Grid Galeri Foto",
        "style": {
          "display": "grid",
          "gridTemplateColumns": "repeat(auto-fill, minmax(130px, 1fr))",
          "gap": 12,
          "width": "100%"
        },
        "children": [
          {
            "id": "sage_green-image-gallery-master",
            "type": "image",
            "label": "Master Item Foto Galeri",
            "showInGallery": true,
            "content": "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80",
            "style": {
              "width": "100%",
              "aspectRatio": "1 / 1",
              "borderRadius": 16,
              "objectFit": "cover",
              "boxShadow": "0 4px 16px rgba(74,93,78,0.06)"
            }
          }
        ]
      }
    ]
  },
  {
    "id": "sage_green-container-rsvp",
    "type": "container",
    "sectionType": "rsvp",
    "label": "rsvp",
    "style": {
      "display": "flex",
      "flexDirection": "column",
      "alignItems": "center",
      "gap": 16,
      "padding": "32px 20px",
      "backgroundColor": "#f5f0e8",
      "width": "100%",
      "margin": "0"
    },
    "children": [
      {
        "id": "sage_green-container-rsvp-title",
        "type": "heading",
        "content": "Konfirmasi Kehadiran",
        "style": {
          "fontFamily": "Cormorant Garamond",
          "color": "#1e293b",
          "fontSize": 20,
          "textAlign": "center"
        }
      },
      {
        "id": "sage_green-container-rsvp-desc",
        "type": "text",
        "content": "Mohon konfirmasi kehadiran Anda sebelum acara.",
        "style": {
          "fontFamily": "Lora",
          "color": "#64748b",
          "fontSize": 14,
          "textAlign": "center"
        }
      }
    ]
  },
  {
    "id": "sage_green-container-wishes",
    "type": "container",
    "sectionType": "wishes",
    "label": "wishes",
    "style": {
      "display": "flex",
      "flexDirection": "column",
      "alignItems": "center",
      "gap": 16,
      "padding": "32px 20px",
      "backgroundColor": "#f5f0e8",
      "width": "100%",
      "margin": "0"
    },
    "children": [
      {
        "id": "sage_green-container-wishes-feed",
        "type": "container",
        "isWishesFeed": true,
        "style": {
          "display": "flex",
          "flexDirection": "column",
          "gap": 16,
          "width": "100%"
        },
        "children": []
      }
    ]
  },
  {
    "id": "sage_green-container-gift",
    "type": "container",
    "sectionType": "gift",
    "label": "gift",
    "style": {
      "display": "flex",
      "flexDirection": "column",
      "alignItems": "center",
      "gap": 16,
      "padding": "32px 20px",
      "backgroundColor": "#f5f0e8",
      "width": "100%",
      "margin": "0"
    },
    "children": [
      {
        "id": "sage_green-container-gift-title",
        "type": "heading",
        "content": "Wedding Gift",
        "style": {
          "fontFamily": "Cormorant Garamond",
          "color": "#1e293b",
          "fontSize": 20,
          "textAlign": "center"
        }
      }
    ]
  },
  {
    "id": "sage_green-container-ig_stories",
    "type": "container",
    "sectionType": "ig_stories",
    "label": "ig_stories",
    "style": {
      "display": "flex",
      "flexDirection": "column",
      "alignItems": "center",
      "gap": 16,
      "padding": "32px 20px",
      "backgroundColor": "#f5f0e8",
      "width": "100%",
      "margin": "0"
    },
    "children": [
      {
        "id": "sage_green-container-ig_stories-title",
        "type": "heading",
        "content": "Instagram Stories",
        "style": {
          "fontFamily": "Cormorant Garamond",
          "color": "#1e293b",
          "fontSize": 20,
          "textAlign": "center"
        }
      }
    ]
  },
  {
    "id": "sage_green-container-thank_you",
    "type": "container",
    "sectionType": "thank_you",
    "label": "thank_you",
    "style": {
      "display": "flex",
      "flexDirection": "column",
      "alignItems": "center",
      "gap": 16,
      "padding": "32px 20px",
      "backgroundColor": "#f5f0e8",
      "width": "100%",
      "margin": "0"
    },
    "children": [
      {
        "id": "sage_green-container-thank_you-title",
        "type": "heading",
        "content": "Terima Kasih",
        "style": {
          "fontFamily": "Cormorant Garamond",
          "color": "#1e293b",
          "fontSize": 20,
          "textAlign": "center"
        }
      }
    ]
  },
  {
    "id": "sage_green-container-footer",
    "type": "container",
    "sectionType": "footer",
    "label": "footer",
    "style": {
      "display": "flex",
      "flexDirection": "column",
      "alignItems": "center",
      "gap": 16,
      "padding": "32px 20px",
      "backgroundColor": "#f5f0e8",
      "width": "100%",
      "margin": "0"
    },
    "children": [
      {
        "id": "sage_green-container-footer-desc",
        "type": "text",
        "content": "Powered by JoinMe",
        "style": {
          "fontFamily": "Lora",
          "color": "#64748b",
          "fontSize": 12,
          "textAlign": "center"
        }
      }
    ]
  }
];

export const NEON_PARTY_GLOBAL_STYLES = {
  "bgColor": "#0f0f1a",
  "padding": "0px",
  "margin": "0px",
  "fontFamily": "Space Grotesk"
};

export const NEON_PARTY_NODES = [
  {
    "id": "neon_party-container-cover",
    "type": "container",
    "sectionType": "cover",
    "label": "cover",
    "style": {
      "display": "flex",
      "flexDirection": "column",
      "alignItems": "center",
      "gap": 16,
      "padding": "32px 20px",
      "backgroundColor": "#0f0f1a",
      "width": "100%",
      "margin": "0"
    },
    "children": [
      {
        "id": "neon_party-container-cover-title",
        "type": "heading",
        "content": "🎉 HAPPY BIRTHDAY",
        "style": {
          "fontFamily": "Space Grotesk",
          "color": "#f0f0f0",
          "fontSize": 32,
          "textAlign": "center"
        }
      },
      {
        "id": "neon_party-container-cover-btn",
        "type": "button",
        "content": "Buka Undangan",
        "buttonAction": "open-invitation",
        "style": {
          "backgroundColor": "#ff2d95",
          "color": "#ffffff",
          "borderRadius": 16,
          "padding": "12px 24px",
          "fontFamily": "Inter"
        }
      }
    ]
  },
  {
    "id": "neon_party-container-hero",
    "type": "container",
    "sectionType": "hero",
    "label": "hero",
    "style": {
      "display": "flex",
      "flexDirection": "column",
      "alignItems": "center",
      "gap": 16,
      "padding": "32px 20px",
      "backgroundColor": "#0f0f1a",
      "width": "100%",
      "margin": "0"
    },
    "children": [
      {
        "id": "neon_party-container-hero-title",
        "type": "heading",
        "content": "Kami Mengundang Anda",
        "style": {
          "fontFamily": "Space Grotesk",
          "color": "#f0f0f0",
          "fontSize": 24,
          "textAlign": "center"
        }
      }
    ]
  },
  {
    "id": "neon_party-container-opening",
    "type": "container",
    "sectionType": "opening",
    "label": "opening",
    "style": {
      "display": "flex",
      "flexDirection": "column",
      "alignItems": "center",
      "gap": 16,
      "padding": "32px 20px",
      "backgroundColor": "#0f0f1a",
      "width": "100%",
      "margin": "0"
    },
    "children": [
      {
        "id": "neon_party-container-opening-welcome",
        "type": "text",
        "content": "Selamat datang di acara kami. Kami sangat berbahagia bisa berbagi momen ini bersama Anda.",
        "style": {
          "fontFamily": "Inter",
          "color": "#a0a0b0",
          "fontSize": 16,
          "textAlign": "center"
        }
      }
    ]
  },
  {
    "id": "neon_party-container-bride_groom",
    "type": "container",
    "sectionType": "bride_groom",
    "label": "Section Profil Yang Berulang Tahun",
    "style": {
      "display": "flex",
      "flexDirection": "column",
      "alignItems": "center",
      "gap": 16,
      "padding": "32px 20px",
      "backgroundColor": "#0f0f1a",
      "width": "100%",
      "margin": "0"
    },
    "children": [
      {
        "id": "neon_party-container-bride_groom-vars",
        "type": "text",
        "content": "{nama_yang_ultah}",
        "style": {
          "fontFamily": "Space Grotesk",
          "color": "#00d4ff",
          "fontSize": 24,
          "textAlign": "center"
        }
      }
    ]
  },
  {
    "id": "neon_party-container-event_schedule",
    "type": "container",
    "sectionType": "event_schedule",
    "label": "event_schedule",
    "style": {
      "display": "flex",
      "flexDirection": "column",
      "alignItems": "center",
      "gap": 16,
      "padding": "32px 20px",
      "backgroundColor": "#0f0f1a",
      "width": "100%",
      "margin": "0"
    },
    "children": [
      {
        "id": "neon_party-heading-schedule",
        "type": "heading",
        "content": "Jadwal & Lokasi Pesta",
        "style": {
          "fontFamily": "Space Grotesk",
          "color": "#f0f0f0",
          "fontSize": 24,
          "textAlign": "center"
        }
      },
      {
        "id": "neon_party-container-event_schedule-feed",
        "type": "container",
        "isEventFeed": true,
        "label": "Daftar Jadwal Acara",
        "style": {
          "display": "flex",
          "flexDirection": "column",
          "gap": 16,
          "width": "100%"
        },
        "children": [
          {
            "id": "neon_party-card-event-master",
            "type": "container",
            "label": "Kartu Master Acara",
            "style": {
              "display": "flex",
              "flexDirection": "column",
              "alignItems": "center",
              "gap": 10,
              "padding": "24px 20px",
              "backgroundColor": "#1a1a2e",
              "borderRadius": 16,
              "borderStyle": "solid",
              "borderWidth": 1,
              "borderColor": "#334155",
              "boxShadow": "0 4px 20px rgba(255,45,149,0.1)",
              "width": "100%"
            },
            "children": [
              {
                "id": "neon_party-event-title",
                "type": "heading",
                "content": "{{event_title}}",
                "style": {
                  "fontSize": 20,
                  "color": "#f0f0f0",
                  "fontWeight": "bold",
                  "fontFamily": "Space Grotesk",
                  "textAlign": "center"
                }
              },
              {
                "id": "neon_party-event-datetime",
                "type": "text",
                "content": "📅 {{event_date}} • 🕘 {{event_time}}",
                "style": {
                  "fontSize": 13,
                  "color": "#00d4ff",
                  "fontWeight": "bold",
                  "fontFamily": "Inter",
                  "textAlign": "center"
                }
              },
              {
                "id": "neon_party-event-location",
                "type": "text",
                "content": "📍 {{event_location}}",
                "style": {
                  "fontSize": 14,
                  "color": "#f0f0f0",
                  "fontWeight": "bold",
                  "fontFamily": "Inter",
                  "textAlign": "center"
                }
              },
              {
                "id": "neon_party-event-address",
                "type": "text",
                "content": "{{event_address}}",
                "style": {
                  "fontSize": 12,
                  "color": "#a0a0b0",
                  "fontFamily": "Inter",
                  "textAlign": "center"
                }
              },
              {
                "id": "neon_party-event-btn-map",
                "type": "button",
                "content": "🗺️ Buka Google Maps",
                "buttonAction": "google-maps",
                "style": {
                  "backgroundColor": "#ff2d95",
                  "color": "#ffffff",
                  "borderRadius": 16,
                  "padding": "8px 20px",
                  "fontSize": 12,
                  "fontWeight": "bold",
                  "fontFamily": "Inter"
                }
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "neon_party-container-live_streaming",
    "type": "container",
    "sectionType": "live_streaming",
    "label": "live_streaming",
    "style": {
      "display": "flex",
      "flexDirection": "column",
      "alignItems": "center",
      "gap": 16,
      "padding": "32px 20px",
      "backgroundColor": "#0f0f1a",
      "width": "100%",
      "margin": "0"
    },
    "children": [
      {
        "id": "neon_party-container-live_streaming-title",
        "type": "heading",
        "content": "Live Streaming",
        "style": {
          "fontFamily": "Space Grotesk",
          "color": "#f0f0f0",
          "fontSize": 20,
          "textAlign": "center"
        }
      }
    ]
  },
  {
    "id": "neon_party-container-love_story",
    "type": "container",
    "sectionType": "love_story",
    "label": "love_story",
    "style": {
      "display": "flex",
      "flexDirection": "column",
      "alignItems": "center",
      "gap": 16,
      "padding": "32px 20px",
      "backgroundColor": "#0f0f1a",
      "width": "100%",
      "margin": "0"
    },
    "children": [
      {
        "id": "neon_party-container-love_story-title",
        "type": "heading",
        "content": "Kisah Perjalanan Cinta",
        "style": {
          "fontFamily": "Space Grotesk",
          "color": "#f0f0f0",
          "fontSize": 24,
          "textAlign": "center"
        }
      },
      {
        "id": "neon_party-container-love_story-feed",
        "type": "container",
        "isStoryFeed": true,
        "label": "Daftar Kisah Cinta",
        "style": {
          "display": "flex",
          "flexDirection": "column",
          "gap": 16,
          "width": "100%"
        },
        "children": [
          {
            "id": "neon_party-card-story-master",
            "type": "container",
            "label": "Kartu Master Cerita",
            "style": {
              "display": "flex",
              "flexDirection": "column",
              "alignItems": "center",
              "gap": 10,
              "padding": "24px 20px",
              "backgroundColor": "#1a1a2e",
              "borderRadius": 16,
              "borderStyle": "solid",
              "borderWidth": 1,
              "borderColor": "#334155",
              "boxShadow": "0 4px 20px rgba(255,45,149,0.1)",
              "width": "100%"
            },
            "children": [
              {
                "id": "neon_party-story-badge",
                "type": "text",
                "content": "📅 {story_year}",
                "style": {
                  "fontSize": 12,
                  "color": "#00d4ff",
                  "fontWeight": "bold",
                  "fontFamily": "Inter",
                  "backgroundColor": "rgba(0,212,255,0.1)",
                  "padding": "4px 14px",
                  "borderRadius": 20,
                  "textAlign": "center"
                }
              },
              {
                "id": "neon_party-story-title",
                "type": "heading",
                "content": "{story_title}",
                "style": {
                  "fontSize": 18,
                  "color": "#ff2d95",
                  "fontWeight": "bold",
                  "fontFamily": "Space Grotesk",
                  "textAlign": "center"
                }
              },
              {
                "id": "neon_party-story-desc",
                "type": "text",
                "content": "{story_description}",
                "style": {
                  "fontSize": 13,
                  "color": "#a0a0b0",
                  "fontFamily": "Inter",
                  "textAlign": "center",
                  "lineHeight": "1.6"
                }
              },
              {
                "id": "neon_party-story-img",
                "type": "image",
                "content": "{story_image}",
                "style": {
                  "width": "100%",
                  "height": "200px",
                  "borderRadius": 12,
                  "objectFit": "cover",
                  "margin": "8px 0px 0px 0px"
                }
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "neon_party-container-gallery",
    "type": "container",
    "sectionType": "gallery",
    "label": "gallery",
    "style": {
      "display": "flex",
      "flexDirection": "column",
      "alignItems": "center",
      "gap": 16,
      "padding": "32px 20px",
      "backgroundColor": "#0f0f1a",
      "width": "100%",
      "margin": "0"
    },
    "children": [
      {
        "id": "neon_party-heading-gallery",
        "type": "heading",
        "content": "Galeri Momen Pesta",
        "style": {
          "fontFamily": "Space Grotesk",
          "color": "#f0f0f0",
          "fontSize": 24,
          "textAlign": "center"
        }
      },
      {
        "id": "neon_party-feed-gallery",
        "type": "container",
        "isGalleryFeed": true,
        "label": "Grid Galeri Foto",
        "style": {
          "display": "grid",
          "gridTemplateColumns": "repeat(auto-fill, minmax(130px, 1fr))",
          "gap": 12,
          "width": "100%"
        },
        "children": [
          {
            "id": "neon_party-image-gallery-master",
            "type": "image",
            "label": "Master Item Foto Galeri",
            "showInGallery": true,
            "content": "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80",
            "style": {
              "width": "100%",
              "aspectRatio": "1 / 1",
              "borderRadius": 14,
              "objectFit": "cover",
              "boxShadow": "0 4px 20px rgba(0,212,255,0.1)",
              "borderStyle": "solid",
              "borderWidth": 1,
              "borderColor": "#334155"
            }
          }
        ]
      }
    ]
  },
  {
    "id": "neon_party-container-rsvp",
    "type": "container",
    "sectionType": "rsvp",
    "label": "rsvp",
    "style": {
      "display": "flex",
      "flexDirection": "column",
      "alignItems": "center",
      "gap": 16,
      "padding": "32px 20px",
      "backgroundColor": "#0f0f1a",
      "width": "100%",
      "margin": "0"
    },
    "children": [
      {
        "id": "neon_party-container-rsvp-title",
        "type": "heading",
        "content": "Konfirmasi Kehadiran",
        "style": {
          "fontFamily": "Space Grotesk",
          "color": "#f0f0f0",
          "fontSize": 20,
          "textAlign": "center"
        }
      },
      {
        "id": "neon_party-container-rsvp-desc",
        "type": "text",
        "content": "Mohon konfirmasi kehadiran Anda sebelum acara.",
        "style": {
          "fontFamily": "Inter",
          "color": "#a0a0b0",
          "fontSize": 14,
          "textAlign": "center"
        }
      }
    ]
  },
  {
    "id": "neon_party-container-wishes",
    "type": "container",
    "sectionType": "wishes",
    "label": "wishes",
    "style": {
      "display": "flex",
      "flexDirection": "column",
      "alignItems": "center",
      "gap": 16,
      "padding": "32px 20px",
      "backgroundColor": "#0f0f1a",
      "width": "100%",
      "margin": "0"
    },
    "children": [
      {
        "id": "neon_party-container-wishes-feed",
        "type": "container",
        "isWishesFeed": true,
        "style": {
          "display": "flex",
          "flexDirection": "column",
          "gap": 16,
          "width": "100%"
        },
        "children": []
      }
    ]
  },
  {
    "id": "neon_party-container-gift",
    "type": "container",
    "sectionType": "gift",
    "label": "gift",
    "style": {
      "display": "flex",
      "flexDirection": "column",
      "alignItems": "center",
      "gap": 16,
      "padding": "32px 20px",
      "backgroundColor": "#0f0f1a",
      "width": "100%",
      "margin": "0"
    },
    "children": [
      {
        "id": "neon_party-container-gift-title",
        "type": "heading",
        "content": "Wedding Gift",
        "style": {
          "fontFamily": "Space Grotesk",
          "color": "#f0f0f0",
          "fontSize": 20,
          "textAlign": "center"
        }
      }
    ]
  },
  {
    "id": "neon_party-container-ig_stories",
    "type": "container",
    "sectionType": "ig_stories",
    "label": "ig_stories",
    "style": {
      "display": "flex",
      "flexDirection": "column",
      "alignItems": "center",
      "gap": 16,
      "padding": "32px 20px",
      "backgroundColor": "#0f0f1a",
      "width": "100%",
      "margin": "0"
    },
    "children": [
      {
        "id": "neon_party-container-ig_stories-title",
        "type": "heading",
        "content": "Instagram Stories",
        "style": {
          "fontFamily": "Space Grotesk",
          "color": "#f0f0f0",
          "fontSize": 20,
          "textAlign": "center"
        }
      }
    ]
  },
  {
    "id": "neon_party-container-thank_you",
    "type": "container",
    "sectionType": "thank_you",
    "label": "thank_you",
    "style": {
      "display": "flex",
      "flexDirection": "column",
      "alignItems": "center",
      "gap": 16,
      "padding": "32px 20px",
      "backgroundColor": "#0f0f1a",
      "width": "100%",
      "margin": "0"
    },
    "children": [
      {
        "id": "neon_party-container-thank_you-title",
        "type": "heading",
        "content": "Terima Kasih",
        "style": {
          "fontFamily": "Space Grotesk",
          "color": "#f0f0f0",
          "fontSize": 20,
          "textAlign": "center"
        }
      }
    ]
  },
  {
    "id": "neon_party-container-footer",
    "type": "container",
    "sectionType": "footer",
    "label": "footer",
    "style": {
      "display": "flex",
      "flexDirection": "column",
      "alignItems": "center",
      "gap": 16,
      "padding": "32px 20px",
      "backgroundColor": "#0f0f1a",
      "width": "100%",
      "margin": "0"
    },
    "children": [
      {
        "id": "neon_party-container-footer-desc",
        "type": "text",
        "content": "Powered by JoinMe",
        "style": {
          "fontFamily": "Inter",
          "color": "#a0a0b0",
          "fontSize": 12,
          "textAlign": "center"
        }
      }
    ]
  }
];

export const WARM_BOTANICAL_GLOBAL_STYLES = {
  "bgColor": "#faf6f0",
  "padding": "0px",
  "margin": "0px",
  "fontFamily": "Lora"
};

export const WARM_BOTANICAL_NODES = [
  {
    "id": "warm_botanical-container-cover",
    "type": "container",
    "sectionType": "cover",
    "label": "cover",
    "style": {
      "display": "flex",
      "flexDirection": "column",
      "alignItems": "center",
      "gap": 16,
      "padding": "32px 20px",
      "backgroundColor": "#faf6f0",
      "width": "100%",
      "margin": "0"
    },
    "children": [
      {
        "id": "warm_botanical-container-cover-title",
        "type": "heading",
        "content": "SYUKURAN",
        "style": {
          "fontFamily": "Lora",
          "color": "#1e293b",
          "fontSize": 32,
          "textAlign": "center"
        }
      },
      {
        "id": "warm_botanical-container-cover-btn",
        "type": "button",
        "content": "Buka Undangan",
        "buttonAction": "open-invitation",
        "style": {
          "backgroundColor": "#8b5e3c",
          "color": "#ffffff",
          "borderRadius": 24,
          "padding": "12px 24px",
          "fontFamily": "Nunito"
        }
      }
    ]
  },
  {
    "id": "warm_botanical-container-hero",
    "type": "container",
    "sectionType": "hero",
    "label": "hero",
    "style": {
      "display": "flex",
      "flexDirection": "column",
      "alignItems": "center",
      "gap": 16,
      "padding": "32px 20px",
      "backgroundColor": "#faf6f0",
      "width": "100%",
      "margin": "0"
    },
    "children": [
      {
        "id": "warm_botanical-container-hero-title",
        "type": "heading",
        "content": "Kami Mengundang Anda",
        "style": {
          "fontFamily": "Lora",
          "color": "#1e293b",
          "fontSize": 24,
          "textAlign": "center"
        }
      }
    ]
  },
  {
    "id": "warm_botanical-container-opening",
    "type": "container",
    "sectionType": "opening",
    "label": "opening",
    "style": {
      "display": "flex",
      "flexDirection": "column",
      "alignItems": "center",
      "gap": 16,
      "padding": "32px 20px",
      "backgroundColor": "#faf6f0",
      "width": "100%",
      "margin": "0"
    },
    "children": [
      {
        "id": "warm_botanical-container-opening-verse",
        "type": "text",
        "content": "\"Sesungguhnya jika kamu bersyukur, niscaya Aku akan menambah (nikmat) kepadamu...\" (QS. Ibrahim: 7)",
        "style": {
          "fontFamily": "Nunito",
          "color": "#64748b",
          "fontSize": 16,
          "textAlign": "center",
          "fontStyle": "italic"
        }
      }
    ]
  },
  {
    "id": "warm_botanical-container-bride_groom",
    "type": "container",
    "sectionType": "bride_groom",
    "label": "Penyelenggara",
    "style": {
      "display": "flex",
      "flexDirection": "column",
      "alignItems": "center",
      "gap": 16,
      "padding": "32px 20px",
      "backgroundColor": "#faf6f0",
      "width": "100%",
      "margin": "0"
    },
    "children": [
      {
        "id": "warm_botanical-container-bride_groom-vars",
        "type": "text",
        "content": "{penyelenggara}",
        "style": {
          "fontFamily": "Lora",
          "color": "#c4775a",
          "fontSize": 24,
          "textAlign": "center"
        }
      }
    ]
  },
  {
    "id": "warm_botanical-container-event_schedule",
    "type": "container",
    "sectionType": "event_schedule",
    "label": "event_schedule",
    "style": {
      "display": "flex",
      "flexDirection": "column",
      "alignItems": "center",
      "gap": 16,
      "padding": "32px 20px",
      "backgroundColor": "#faf6f0",
      "width": "100%",
      "margin": "0"
    },
    "children": [
      {
        "id": "warm_botanical-heading-schedule",
        "type": "heading",
        "content": "Waktu & Lokasi Syukuran",
        "style": {
          "fontFamily": "Lora",
          "color": "#8b5e3c",
          "fontSize": 24,
          "textAlign": "center"
        }
      },
      {
        "id": "warm_botanical-container-event_schedule-feed",
        "type": "container",
        "isEventFeed": true,
        "label": "Daftar Jadwal Acara",
        "style": {
          "display": "flex",
          "flexDirection": "column",
          "gap": 16,
          "width": "100%"
        },
        "children": [
          {
            "id": "warm_botanical-card-event-master",
            "type": "container",
            "label": "Kartu Master Acara",
            "style": {
              "display": "flex",
              "flexDirection": "column",
              "alignItems": "center",
              "gap": 10,
              "padding": "24px 20px",
              "backgroundColor": "#ffffff",
              "borderRadius": 24,
              "borderStyle": "solid",
              "borderWidth": 1,
              "borderColor": "#ebdcd0",
              "boxShadow": "0 4px 16px rgba(139,94,60,0.06)",
              "width": "100%"
            },
            "children": [
              {
                "id": "warm_botanical-event-title",
                "type": "heading",
                "content": "{{event_title}}",
                "style": {
                  "fontSize": 20,
                  "color": "#8b5e3c",
                  "fontWeight": "bold",
                  "fontFamily": "Lora",
                  "textAlign": "center"
                }
              },
              {
                "id": "warm_botanical-event-datetime",
                "type": "text",
                "content": "📅 {{event_date}} • 🕘 {{event_time}}",
                "style": {
                  "fontSize": 13,
                  "color": "#c4775a",
                  "fontWeight": "bold",
                  "fontFamily": "Lora",
                  "textAlign": "center"
                }
              },
              {
                "id": "warm_botanical-event-location",
                "type": "text",
                "content": "📍 {{event_location}}",
                "style": {
                  "fontSize": 14,
                  "color": "#4a3525",
                  "fontWeight": "bold",
                  "fontFamily": "Lora",
                  "textAlign": "center"
                }
              },
              {
                "id": "warm_botanical-event-address",
                "type": "text",
                "content": "{{event_address}}",
                "style": {
                  "fontSize": 12,
                  "color": "#7c6853",
                  "fontFamily": "Lora",
                  "textAlign": "center"
                }
              },
              {
                "id": "warm_botanical-event-btn-map",
                "type": "button",
                "content": "🗺️ Buka Google Maps",
                "buttonAction": "google-maps",
                "style": {
                  "backgroundColor": "#8b5e3c",
                  "color": "#ffffff",
                  "borderRadius": 24,
                  "padding": "8px 20px",
                  "fontSize": 12,
                  "fontWeight": "bold",
                  "fontFamily": "Lora"
                }
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "warm_botanical-container-live_streaming",
    "type": "container",
    "sectionType": "live_streaming",
    "label": "live_streaming",
    "style": {
      "display": "flex",
      "flexDirection": "column",
      "alignItems": "center",
      "gap": 16,
      "padding": "32px 20px",
      "backgroundColor": "#faf6f0",
      "width": "100%",
      "margin": "0"
    },
    "children": [
      {
        "id": "warm_botanical-container-live_streaming-title",
        "type": "heading",
        "content": "Live Streaming",
        "style": {
          "fontFamily": "Lora",
          "color": "#1e293b",
          "fontSize": 20,
          "textAlign": "center"
        }
      }
    ]
  },
  {
    "id": "warm_botanical-container-love_story",
    "type": "container",
    "sectionType": "love_story",
    "label": "love_story",
    "style": {
      "display": "flex",
      "flexDirection": "column",
      "alignItems": "center",
      "gap": 16,
      "padding": "32px 20px",
      "backgroundColor": "#faf6f0",
      "width": "100%",
      "margin": "0"
    },
    "children": [
      {
        "id": "warm_botanical-container-love_story-title",
        "type": "heading",
        "content": "Kisah Kasih & Kenangan",
        "style": {
          "fontFamily": "Lora",
          "color": "#8b5e3c",
          "fontSize": 24,
          "textAlign": "center"
        }
      },
      {
        "id": "warm_botanical-container-love_story-feed",
        "type": "container",
        "isStoryFeed": true,
        "label": "Daftar Kisah Cinta",
        "style": {
          "display": "flex",
          "flexDirection": "column",
          "gap": 16,
          "width": "100%"
        },
        "children": [
          {
            "id": "warm_botanical-card-story-master",
            "type": "container",
            "label": "Kartu Master Cerita",
            "style": {
              "display": "flex",
              "flexDirection": "column",
              "alignItems": "center",
              "gap": 10,
              "padding": "24px 20px",
              "backgroundColor": "#ffffff",
              "borderRadius": 24,
              "borderStyle": "solid",
              "borderWidth": 1,
              "borderColor": "#ebdcd0",
              "boxShadow": "0 4px 16px rgba(139,94,60,0.06)",
              "width": "100%"
            },
            "children": [
              {
                "id": "warm_botanical-story-badge",
                "type": "text",
                "content": "📅 {story_year}",
                "style": {
                  "fontSize": 12,
                  "color": "#c4775a",
                  "fontWeight": "bold",
                  "fontFamily": "Lora",
                  "backgroundColor": "#fdf8f5",
                  "padding": "4px 14px",
                  "borderRadius": 20,
                  "textAlign": "center"
                }
              },
              {
                "id": "warm_botanical-story-title",
                "type": "heading",
                "content": "{story_title}",
                "style": {
                  "fontSize": 18,
                  "color": "#8b5e3c",
                  "fontWeight": "bold",
                  "fontFamily": "Lora",
                  "textAlign": "center"
                }
              },
              {
                "id": "warm_botanical-story-desc",
                "type": "text",
                "content": "{story_description}",
                "style": {
                  "fontSize": 13,
                  "color": "#7c6853",
                  "fontFamily": "Lora",
                  "textAlign": "center",
                  "lineHeight": "1.6"
                }
              },
              {
                "id": "warm_botanical-story-img",
                "type": "image",
                "content": "{story_image}",
                "style": {
                  "width": "100%",
                  "height": "200px",
                  "borderRadius": 16,
                  "objectFit": "cover",
                  "margin": "8px 0px 0px 0px"
                }
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "warm_botanical-container-gallery",
    "type": "container",
    "sectionType": "gallery",
    "label": "gallery",
    "style": {
      "display": "flex",
      "flexDirection": "column",
      "alignItems": "center",
      "gap": 16,
      "padding": "32px 20px",
      "backgroundColor": "#faf6f0",
      "width": "100%",
      "margin": "0"
    },
    "children": [
      {
        "id": "warm_botanical-heading-gallery",
        "type": "heading",
        "content": "Galeri Momen Bahagia",
        "style": {
          "fontFamily": "Lora",
          "color": "#8b5e3c",
          "fontSize": 24,
          "textAlign": "center"
        }
      },
      {
        "id": "warm_botanical-feed-gallery",
        "type": "container",
        "isGalleryFeed": true,
        "label": "Grid Galeri Foto",
        "style": {
          "display": "grid",
          "gridTemplateColumns": "repeat(auto-fill, minmax(130px, 1fr))",
          "gap": 12,
          "width": "100%"
        },
        "children": [
          {
            "id": "warm_botanical-image-gallery-master",
            "type": "image",
            "label": "Master Item Foto Galeri",
            "showInGallery": true,
            "content": "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80",
            "style": {
              "width": "100%",
              "aspectRatio": "1 / 1",
              "borderRadius": 20,
              "objectFit": "cover",
              "boxShadow": "0 4px 16px rgba(139,94,60,0.06)"
            }
          }
        ]
      }
    ]
  },
  {
    "id": "warm_botanical-container-rsvp",
    "type": "container",
    "sectionType": "rsvp",
    "label": "rsvp",
    "style": {
      "display": "flex",
      "flexDirection": "column",
      "alignItems": "center",
      "gap": 16,
      "padding": "32px 20px",
      "backgroundColor": "#faf6f0",
      "width": "100%",
      "margin": "0"
    },
    "children": [
      {
        "id": "warm_botanical-container-rsvp-title",
        "type": "heading",
        "content": "Konfirmasi Kehadiran",
        "style": {
          "fontFamily": "Lora",
          "color": "#1e293b",
          "fontSize": 20,
          "textAlign": "center"
        }
      },
      {
        "id": "warm_botanical-container-rsvp-desc",
        "type": "text",
        "content": "Mohon konfirmasi kehadiran Anda sebelum acara.",
        "style": {
          "fontFamily": "Nunito",
          "color": "#64748b",
          "fontSize": 14,
          "textAlign": "center"
        }
      }
    ]
  },
  {
    "id": "warm_botanical-container-wishes",
    "type": "container",
    "sectionType": "wishes",
    "label": "wishes",
    "style": {
      "display": "flex",
      "flexDirection": "column",
      "alignItems": "center",
      "gap": 16,
      "padding": "32px 20px",
      "backgroundColor": "#faf6f0",
      "width": "100%",
      "margin": "0"
    },
    "children": [
      {
        "id": "warm_botanical-container-wishes-feed",
        "type": "container",
        "isWishesFeed": true,
        "style": {
          "display": "flex",
          "flexDirection": "column",
          "gap": 16,
          "width": "100%"
        },
        "children": []
      }
    ]
  },
  {
    "id": "warm_botanical-container-gift",
    "type": "container",
    "sectionType": "gift",
    "label": "gift",
    "style": {
      "display": "flex",
      "flexDirection": "column",
      "alignItems": "center",
      "gap": 16,
      "padding": "32px 20px",
      "backgroundColor": "#faf6f0",
      "width": "100%",
      "margin": "0"
    },
    "children": [
      {
        "id": "warm_botanical-container-gift-title",
        "type": "heading",
        "content": "Wedding Gift",
        "style": {
          "fontFamily": "Lora",
          "color": "#1e293b",
          "fontSize": 20,
          "textAlign": "center"
        }
      }
    ]
  },
  {
    "id": "warm_botanical-container-ig_stories",
    "type": "container",
    "sectionType": "ig_stories",
    "label": "ig_stories",
    "style": {
      "display": "flex",
      "flexDirection": "column",
      "alignItems": "center",
      "gap": 16,
      "padding": "32px 20px",
      "backgroundColor": "#faf6f0",
      "width": "100%",
      "margin": "0"
    },
    "children": [
      {
        "id": "warm_botanical-container-ig_stories-title",
        "type": "heading",
        "content": "Instagram Stories",
        "style": {
          "fontFamily": "Lora",
          "color": "#1e293b",
          "fontSize": 20,
          "textAlign": "center"
        }
      }
    ]
  },
  {
    "id": "warm_botanical-container-thank_you",
    "type": "container",
    "sectionType": "thank_you",
    "label": "thank_you",
    "style": {
      "display": "flex",
      "flexDirection": "column",
      "alignItems": "center",
      "gap": 16,
      "padding": "32px 20px",
      "backgroundColor": "#faf6f0",
      "width": "100%",
      "margin": "0"
    },
    "children": [
      {
        "id": "warm_botanical-container-thank_you-title",
        "type": "heading",
        "content": "Terima Kasih",
        "style": {
          "fontFamily": "Lora",
          "color": "#1e293b",
          "fontSize": 20,
          "textAlign": "center"
        }
      }
    ]
  },
  {
    "id": "warm_botanical-container-footer",
    "type": "container",
    "sectionType": "footer",
    "label": "footer",
    "style": {
      "display": "flex",
      "flexDirection": "column",
      "alignItems": "center",
      "gap": 16,
      "padding": "32px 20px",
      "backgroundColor": "#faf6f0",
      "width": "100%",
      "margin": "0"
    },
    "children": [
      {
        "id": "warm_botanical-container-footer-desc",
        "type": "text",
        "content": "Powered by JoinMe",
        "style": {
          "fontFamily": "Nunito",
          "color": "#64748b",
          "fontSize": 12,
          "textAlign": "center"
        }
      }
    ]
  }
];

export const CORPORATE_GALA_GLOBAL_STYLES = {
  "bgColor": "#ffffff",
  "padding": "0px",
  "margin": "0px",
  "fontFamily": "Montserrat"
};

export const CORPORATE_GALA_NODES = [
  {
    "id": "corporate_gala-container-cover",
    "type": "container",
    "sectionType": "cover",
    "label": "cover",
    "style": {
      "display": "flex",
      "flexDirection": "column",
      "alignItems": "center",
      "gap": 16,
      "padding": "32px 20px",
      "backgroundColor": "#ffffff",
      "width": "100%",
      "margin": "0"
    },
    "children": [
      {
        "id": "corporate_gala-container-cover-title",
        "type": "heading",
        "content": "YOU'RE INVITED",
        "style": {
          "fontFamily": "Montserrat",
          "color": "#1e293b",
          "fontSize": 32,
          "textAlign": "center"
        }
      },
      {
        "id": "corporate_gala-container-cover-btn",
        "type": "button",
        "content": "Buka Undangan",
        "buttonAction": "open-invitation",
        "style": {
          "backgroundColor": "#1a365d",
          "color": "#ffffff",
          "borderRadius": 12,
          "padding": "12px 24px",
          "fontFamily": "Open Sans"
        }
      }
    ]
  },
  {
    "id": "corporate_gala-container-hero",
    "type": "container",
    "sectionType": "hero",
    "label": "hero",
    "style": {
      "display": "flex",
      "flexDirection": "column",
      "alignItems": "center",
      "gap": 16,
      "padding": "32px 20px",
      "backgroundColor": "#ffffff",
      "width": "100%",
      "margin": "0"
    },
    "children": [
      {
        "id": "corporate_gala-container-hero-title",
        "type": "heading",
        "content": "Kami Mengundang Anda",
        "style": {
          "fontFamily": "Montserrat",
          "color": "#1e293b",
          "fontSize": 24,
          "textAlign": "center"
        }
      }
    ]
  },
  {
    "id": "corporate_gala-container-opening",
    "type": "container",
    "sectionType": "opening",
    "label": "opening",
    "style": {
      "display": "flex",
      "flexDirection": "column",
      "alignItems": "center",
      "gap": 16,
      "padding": "32px 20px",
      "backgroundColor": "#ffffff",
      "width": "100%",
      "margin": "0"
    },
    "children": [
      {
        "id": "corporate_gala-container-opening-welcome",
        "type": "text",
        "content": "Selamat datang di acara kami. Kami sangat berbahagia bisa berbagi momen ini bersama Anda.",
        "style": {
          "fontFamily": "Open Sans",
          "color": "#64748b",
          "fontSize": 16,
          "textAlign": "center"
        }
      }
    ]
  },
  {
    "id": "corporate_gala-container-bride_groom",
    "type": "container",
    "sectionType": "bride_groom",
    "label": "Speaker & Organizer",
    "style": {
      "display": "flex",
      "flexDirection": "column",
      "alignItems": "center",
      "gap": 16,
      "padding": "32px 20px",
      "backgroundColor": "#ffffff",
      "width": "100%",
      "margin": "0"
    },
    "children": [
      {
        "id": "corporate_gala-container-bride_groom-vars",
        "type": "text",
        "content": "{nama_narasumber} & {nama_event}",
        "style": {
          "fontFamily": "Montserrat",
          "color": "#c4a35a",
          "fontSize": 24,
          "textAlign": "center"
        }
      }
    ]
  },
  {
    "id": "corporate_gala-container-event_schedule",
    "type": "container",
    "sectionType": "event_schedule",
    "label": "event_schedule",
    "style": {
      "display": "flex",
      "flexDirection": "column",
      "alignItems": "center",
      "gap": 16,
      "padding": "32px 20px",
      "backgroundColor": "#ffffff",
      "width": "100%",
      "margin": "0"
    },
    "children": [
      {
        "id": "corporate_gala-heading-schedule",
        "type": "heading",
        "content": "Agenda & Lokasi Acara",
        "style": {
          "fontFamily": "Montserrat",
          "color": "#1a365d",
          "fontSize": 24,
          "textAlign": "center"
        }
      },
      {
        "id": "corporate_gala-container-event_schedule-feed",
        "type": "container",
        "isEventFeed": true,
        "label": "Daftar Jadwal Acara",
        "style": {
          "display": "flex",
          "flexDirection": "column",
          "gap": 16,
          "width": "100%"
        },
        "children": [
          {
            "id": "corporate_gala-card-event-master",
            "type": "container",
            "label": "Kartu Master Acara",
            "style": {
              "display": "flex",
              "flexDirection": "column",
              "alignItems": "center",
              "gap": 10,
              "padding": "24px 20px",
              "backgroundColor": "#f8fafc",
              "borderRadius": 12,
              "borderStyle": "solid",
              "borderWidth": 1,
              "borderColor": "#cbd5e1",
              "boxShadow": "0 4px 16px rgba(26,54,93,0.06)",
              "width": "100%"
            },
            "children": [
              {
                "id": "corporate_gala-event-title",
                "type": "heading",
                "content": "{{event_title}}",
                "style": {
                  "fontSize": 20,
                  "color": "#1a365d",
                  "fontWeight": "bold",
                  "fontFamily": "Montserrat",
                  "textAlign": "center"
                }
              },
              {
                "id": "corporate_gala-event-datetime",
                "type": "text",
                "content": "📅 {{event_date}} • 🕘 {{event_time}}",
                "style": {
                  "fontSize": 13,
                  "color": "#c4a35a",
                  "fontWeight": "bold",
                  "fontFamily": "Open Sans",
                  "textAlign": "center"
                }
              },
              {
                "id": "corporate_gala-event-location",
                "type": "text",
                "content": "📍 {{event_location}}",
                "style": {
                  "fontSize": 14,
                  "color": "#1e293b",
                  "fontWeight": "bold",
                  "fontFamily": "Open Sans",
                  "textAlign": "center"
                }
              },
              {
                "id": "corporate_gala-event-address",
                "type": "text",
                "content": "{{event_address}}",
                "style": {
                  "fontSize": 12,
                  "color": "#64748b",
                  "fontFamily": "Open Sans",
                  "textAlign": "center"
                }
              },
              {
                "id": "corporate_gala-event-btn-map",
                "type": "button",
                "content": "🗺️ Buka Google Maps",
                "buttonAction": "google-maps",
                "style": {
                  "backgroundColor": "#1a365d",
                  "color": "#ffffff",
                  "borderRadius": 12,
                  "padding": "8px 20px",
                  "fontSize": 12,
                  "fontWeight": "bold",
                  "fontFamily": "Open Sans"
                }
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "corporate_gala-container-live_streaming",
    "type": "container",
    "sectionType": "live_streaming",
    "label": "live_streaming",
    "style": {
      "display": "flex",
      "flexDirection": "column",
      "alignItems": "center",
      "gap": 16,
      "padding": "32px 20px",
      "backgroundColor": "#ffffff",
      "width": "100%",
      "margin": "0"
    },
    "children": [
      {
        "id": "corporate_gala-container-live_streaming-title",
        "type": "heading",
        "content": "Live Streaming",
        "style": {
          "fontFamily": "Montserrat",
          "color": "#1e293b",
          "fontSize": 20,
          "textAlign": "center"
        }
      }
    ]
  },
  {
    "id": "corporate_gala-container-love_story",
    "type": "container",
    "sectionType": "love_story",
    "label": "love_story",
    "style": {
      "display": "flex",
      "flexDirection": "column",
      "alignItems": "center",
      "gap": 16,
      "padding": "32px 20px",
      "backgroundColor": "#ffffff",
      "width": "100%",
      "margin": "0"
    },
    "children": [
      {
        "id": "corporate_gala-container-love_story-title",
        "type": "heading",
        "content": "Perjalanan & Momen Spesial",
        "style": {
          "fontFamily": "Montserrat",
          "color": "#1a365d",
          "fontSize": 24,
          "textAlign": "center"
        }
      },
      {
        "id": "corporate_gala-container-love_story-feed",
        "type": "container",
        "isStoryFeed": true,
        "label": "Daftar Kisah Cinta",
        "style": {
          "display": "flex",
          "flexDirection": "column",
          "gap": 16,
          "width": "100%"
        },
        "children": [
          {
            "id": "corporate_gala-card-story-master",
            "type": "container",
            "label": "Kartu Master Cerita",
            "style": {
              "display": "flex",
              "flexDirection": "column",
              "alignItems": "center",
              "gap": 10,
              "padding": "24px 20px",
              "backgroundColor": "#f8fafc",
              "borderRadius": 12,
              "borderStyle": "solid",
              "borderWidth": 1,
              "borderColor": "#cbd5e1",
              "boxShadow": "0 4px 16px rgba(26,54,93,0.06)",
              "width": "100%"
            },
            "children": [
              {
                "id": "corporate_gala-story-badge",
                "type": "text",
                "content": "📅 {story_year}",
                "style": {
                  "fontSize": 12,
                  "color": "#c4a35a",
                  "fontWeight": "bold",
                  "fontFamily": "Open Sans",
                  "backgroundColor": "rgba(196,163,90,0.1)",
                  "padding": "4px 14px",
                  "borderRadius": 12,
                  "textAlign": "center"
                }
              },
              {
                "id": "corporate_gala-story-title",
                "type": "heading",
                "content": "{story_title}",
                "style": {
                  "fontSize": 18,
                  "color": "#1a365d",
                  "fontWeight": "bold",
                  "fontFamily": "Montserrat",
                  "textAlign": "center"
                }
              },
              {
                "id": "corporate_gala-story-desc",
                "type": "text",
                "content": "{story_description}",
                "style": {
                  "fontSize": 13,
                  "color": "#64748b",
                  "fontFamily": "Open Sans",
                  "textAlign": "center",
                  "lineHeight": "1.6"
                }
              },
              {
                "id": "corporate_gala-story-img",
                "type": "image",
                "content": "{story_image}",
                "style": {
                  "width": "100%",
                  "height": "200px",
                  "borderRadius": 8,
                  "objectFit": "cover",
                  "margin": "8px 0px 0px 0px"
                }
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "corporate_gala-container-gallery",
    "type": "container",
    "sectionType": "gallery",
    "label": "gallery",
    "style": {
      "display": "flex",
      "flexDirection": "column",
      "alignItems": "center",
      "gap": 16,
      "padding": "32px 20px",
      "backgroundColor": "#ffffff",
      "width": "100%",
      "margin": "0"
    },
    "children": [
      {
        "id": "corporate_gala-heading-gallery",
        "type": "heading",
        "content": "Dokumentasi & Galeri Foto",
        "style": {
          "fontFamily": "Montserrat",
          "color": "#1a365d",
          "fontSize": 24,
          "textAlign": "center"
        }
      },
      {
        "id": "corporate_gala-feed-gallery",
        "type": "container",
        "isGalleryFeed": true,
        "label": "Grid Galeri Foto",
        "style": {
          "display": "grid",
          "gridTemplateColumns": "repeat(auto-fill, minmax(130px, 1fr))",
          "gap": 12,
          "width": "100%"
        },
        "children": [
          {
            "id": "corporate_gala-image-gallery-master",
            "type": "image",
            "label": "Master Item Foto Galeri",
            "showInGallery": true,
            "content": "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80",
            "style": {
              "width": "100%",
              "aspectRatio": "1 / 1",
              "borderRadius": 10,
              "objectFit": "cover",
              "boxShadow": "0 4px 16px rgba(26,54,93,0.06)",
              "borderStyle": "solid",
              "borderWidth": 1,
              "borderColor": "#cbd5e1"
            }
          }
        ]
      }
    ]
  },
  {
    "id": "corporate_gala-container-rsvp",
    "type": "container",
    "sectionType": "rsvp",
    "label": "rsvp",
    "style": {
      "display": "flex",
      "flexDirection": "column",
      "alignItems": "center",
      "gap": 16,
      "padding": "32px 20px",
      "backgroundColor": "#ffffff",
      "width": "100%",
      "margin": "0"
    },
    "children": [
      {
        "id": "corporate_gala-container-rsvp-title",
        "type": "heading",
        "content": "Konfirmasi Kehadiran",
        "style": {
          "fontFamily": "Montserrat",
          "color": "#1e293b",
          "fontSize": 20,
          "textAlign": "center"
        }
      },
      {
        "id": "corporate_gala-container-rsvp-desc",
        "type": "text",
        "content": "Mohon konfirmasi kehadiran Anda sebelum acara.",
        "style": {
          "fontFamily": "Open Sans",
          "color": "#64748b",
          "fontSize": 14,
          "textAlign": "center"
        }
      }
    ]
  },
  {
    "id": "corporate_gala-container-wishes",
    "type": "container",
    "sectionType": "wishes",
    "label": "wishes",
    "style": {
      "display": "flex",
      "flexDirection": "column",
      "alignItems": "center",
      "gap": 16,
      "padding": "32px 20px",
      "backgroundColor": "#ffffff",
      "width": "100%",
      "margin": "0"
    },
    "children": [
      {
        "id": "corporate_gala-container-wishes-feed",
        "type": "container",
        "isWishesFeed": true,
        "style": {
          "display": "flex",
          "flexDirection": "column",
          "gap": 16,
          "width": "100%"
        },
        "children": []
      }
    ]
  },
  {
    "id": "corporate_gala-container-gift",
    "type": "container",
    "sectionType": "gift",
    "label": "gift",
    "style": {
      "display": "flex",
      "flexDirection": "column",
      "alignItems": "center",
      "gap": 16,
      "padding": "32px 20px",
      "backgroundColor": "#ffffff",
      "width": "100%",
      "margin": "0"
    },
    "children": [
      {
        "id": "corporate_gala-container-gift-title",
        "type": "heading",
        "content": "Wedding Gift",
        "style": {
          "fontFamily": "Montserrat",
          "color": "#1e293b",
          "fontSize": 20,
          "textAlign": "center"
        }
      }
    ]
  },
  {
    "id": "corporate_gala-container-ig_stories",
    "type": "container",
    "sectionType": "ig_stories",
    "label": "ig_stories",
    "style": {
      "display": "flex",
      "flexDirection": "column",
      "alignItems": "center",
      "gap": 16,
      "padding": "32px 20px",
      "backgroundColor": "#ffffff",
      "width": "100%",
      "margin": "0"
    },
    "children": [
      {
        "id": "corporate_gala-container-ig_stories-title",
        "type": "heading",
        "content": "Instagram Stories",
        "style": {
          "fontFamily": "Montserrat",
          "color": "#1e293b",
          "fontSize": 20,
          "textAlign": "center"
        }
      }
    ]
  },
  {
    "id": "corporate_gala-container-thank_you",
    "type": "container",
    "sectionType": "thank_you",
    "label": "thank_you",
    "style": {
      "display": "flex",
      "flexDirection": "column",
      "alignItems": "center",
      "gap": 16,
      "padding": "32px 20px",
      "backgroundColor": "#ffffff",
      "width": "100%",
      "margin": "0"
    },
    "children": [
      {
        "id": "corporate_gala-container-thank_you-title",
        "type": "heading",
        "content": "Terima Kasih",
        "style": {
          "fontFamily": "Montserrat",
          "color": "#1e293b",
          "fontSize": 20,
          "textAlign": "center"
        }
      }
    ]
  },
  {
    "id": "corporate_gala-container-footer",
    "type": "container",
    "sectionType": "footer",
    "label": "footer",
    "style": {
      "display": "flex",
      "flexDirection": "column",
      "alignItems": "center",
      "gap": 16,
      "padding": "32px 20px",
      "backgroundColor": "#ffffff",
      "width": "100%",
      "margin": "0"
    },
    "children": [
      {
        "id": "corporate_gala-container-footer-desc",
        "type": "text",
        "content": "Powered by JoinMe",
        "style": {
          "fontFamily": "Open Sans",
          "color": "#64748b",
          "fontSize": 12,
          "textAlign": "center"
        }
      }
    ]
  }
];

