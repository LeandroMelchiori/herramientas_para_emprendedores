/* Datos editoriales estructurados y renderizador de la guia. */
window.PromptCatalog = [
  {
    "key": "redes",
    "emoji": "📱",
    "title": "Redes Sociales",
    "extras": [],
    "cards": [
      {
        "label": "Instagram · Bio",
        "title": "3 versiones de bio para Instagram",
        "sections": [
          {
            "type": "ps-rol",
            "badge": "Rol",
            "html": "Actuá como un experto en marketing digital y branding para pequeños emprendimientos."
          },
          {
            "type": "ps-ctx",
            "badge": "Contexto",
            "html": "Tengo un emprendimiento llamado <em class=\"ph\">[nombre del emprendimiento]</em> que vende/ofrece <em class=\"ph\">[qué vendés o qué servicio das]</em>, especialmente para <em class=\"ph\">[a quién va dirigido]</em>. Lo que me hace diferente es <em class=\"ph\">[qué te hace único/a]</em>."
          },
          {
            "type": "ps-task",
            "badge": "Tarea",
            "html": "Generame 3 versiones de bio para Instagram."
          },
          {
            "type": "ps-fmt",
            "badge": "Formato",
            "html": "3 opciones numeradas, cada una con máximo 150 caracteres y emojis incluidos. Indicá el conteo de caracteres de cada una."
          },
          {
            "type": "ps-tone",
            "badge": "Tono",
            "html": "Una cercana y divertida, una profesional y directa, y una creativa y llamativa."
          }
        ],
        "tip": "💡 Podés pedirle que mezcle elementos de las opciones que más te gusten."
      },
      {
        "label": "Instagram / Facebook · Publicación",
        "title": "Publicación para mostrar un producto o servicio",
        "sections": [
          {
            "type": "ps-rol",
            "badge": "Rol",
            "html": "Actuá como un community manager especializado en redes sociales para emprendedores."
          },
          {
            "type": "ps-ctx",
            "badge": "Contexto",
            "html": "Tengo un emprendimiento de <em class=\"ph\">[rubro]</em> y quiero mostrar el siguiente producto/servicio: <em class=\"ph\">[describí el producto o servicio]</em>. El precio es <em class=\"ph\">[precio o rango]</em>."
          },
          {
            "type": "ps-task",
            "badge": "Tarea",
            "html": "Escribime una publicación para Instagram o Facebook para presentar este producto."
          },
          {
            "type": "ps-fmt",
            "badge": "Formato",
            "html": "Máximo 4 párrafos cortos. Incluí un llamado a la acción al final para que la gente escriba por privado. Usá emojis con moderación."
          },
          {
            "type": "ps-tone",
            "badge": "Tono",
            "html": "<em class=\"ph\">[cercano / profesional / entusiasta]</em>. Que suene como una persona real, no como publicidad genérica."
          }
        ],
        "tip": "💡 Si tenés una promo o descuento, agregalo en el contexto."
      },
      {
        "label": "Instagram · Caption",
        "title": "Texto para una foto \"detrás de escena\"",
        "sections": [
          {
            "type": "ps-rol",
            "badge": "Rol",
            "html": "Actuá como un community manager especializado en contenido auténtico para pequeños emprendimientos."
          },
          {
            "type": "ps-ctx",
            "badge": "Contexto",
            "html": "Tengo un emprendimiento de <em class=\"ph\">[rubro]</em> y voy a publicar una foto mostrando <em class=\"ph\">[qué mostrás: preparación, producción, armado, etc.]</em>."
          },
          {
            "type": "ps-task",
            "badge": "Tarea",
            "html": "Escribime el texto para esa publicación de Instagram mostrando el proceso de trabajo."
          },
          {
            "type": "ps-fmt",
            "badge": "Formato",
            "html": "Máximo 3 párrafos cortos. El primero debe enganchar, el segundo mostrar el esfuerzo, el tercero generar conexión con la audiencia."
          },
          {
            "type": "ps-tone",
            "badge": "Tono",
            "html": "<em class=\"ph\">[cercano / emotivo / orgulloso]</em>. Auténtico, como si lo escribiera yo mismo/a. Sin sonar a publicidad."
          }
        ],
        "tip": "💡 Las publicaciones de proceso tienen mucho más alcance orgánico que las fotos de producto solo."
      },
      {
        "label": "Instagram · Stories",
        "title": "Secuencia de 4 historias para anunciar una novedad",
        "sections": [
          {
            "type": "ps-rol",
            "badge": "Rol",
            "html": "Actuá como un experto en marketing digital para emprendimientos en redes sociales."
          },
          {
            "type": "ps-ctx",
            "badge": "Contexto",
            "html": "Tengo una novedad en mi emprendimiento: <em class=\"ph\">[qué vas a anunciar: nuevo producto, cambio de horario, promo, etc.]</em>."
          },
          {
            "type": "ps-task",
            "badge": "Tarea",
            "html": "Escribime una secuencia de 4 historias de Instagram para anunciar esta novedad generando expectativa."
          },
          {
            "type": "ps-fmt",
            "badge": "Formato",
            "html": "Una historia por slide numerada. Cada una con máximo 2 oraciones cortas para leer en pantalla. La primera debe arrancar con una pregunta que genere intriga."
          },
          {
            "type": "ps-tone",
            "badge": "Tono",
            "html": "<em class=\"ph\">[entusiasta / misterioso / directo]</em>. Que genere ganas de seguir viendo."
          }
        ],
        "tip": "💡 La historia 1 engancha, 2 y 3 desarrollan, la 4 revela y tiene el llamado a la acción."
      },
      {
        "label": "Todos · Hashtags",
        "title": "Hashtags relevantes para una publicación",
        "sections": [
          {
            "type": "ps-rol",
            "badge": "Rol",
            "html": "Actuá como un especialista en posicionamiento orgánico en redes sociales para emprendedores."
          },
          {
            "type": "ps-ctx",
            "badge": "Contexto",
            "html": "Tengo un emprendimiento de <em class=\"ph\">[rubro]</em> ubicado en <em class=\"ph\">[ciudad o región]</em>. Acabo de publicar sobre <em class=\"ph\">[de qué trata la publicación]</em>."
          },
          {
            "type": "ps-task",
            "badge": "Tarea",
            "html": "Generame una lista de hashtags relevantes para esa publicación."
          },
          {
            "type": "ps-fmt",
            "badge": "Formato",
            "html": "Entre 15 y 20 hashtags en español, organizados en 3 grupos: hashtags populares del rubro, hashtags locales y hashtags de nicho."
          },
          {
            "type": "ps-tone",
            "badge": "Tono",
            "html": "Solo listá los hashtags agrupados, sin explicaciones largas."
          }
        ],
        "tip": "💡 Los hashtags locales (ej: #SantaFe #EmprendedoresSantaFe) tienen menos competencia y más alcance en tu zona."
      }
    ]
  },
  {
    "key": "ventas",
    "emoji": "💬",
    "title": "Ventas y Atención al Cliente",
    "extras": [],
    "cards": [
      {
        "label": "WhatsApp · Respuesta rápida",
        "title": "Responder consulta de precio de forma persuasiva",
        "sections": [
          {
            "type": "ps-rol",
            "badge": "Rol",
            "html": "Actuá como un especialista en ventas y atención al cliente para pequeños emprendimientos."
          },
          {
            "type": "ps-ctx",
            "badge": "Contexto",
            "html": "Un cliente me preguntó por WhatsApp: \"<em class=\"ph\">[copiá la pregunta del cliente]</em>\". Mi producto/servicio es <em class=\"ph\">[descripción breve]</em> y el precio es <em class=\"ph\">[precio]</em>."
          },
          {
            "type": "ps-task",
            "badge": "Tarea",
            "html": "Escribime una respuesta que justifique el valor del precio sin sonar a vendedor/a agresivo/a."
          },
          {
            "type": "ps-fmt",
            "badge": "Formato",
            "html": "Máximo 3 oraciones. Cerrá con una pregunta abierta para continuar la conversación."
          },
          {
            "type": "ps-tone",
            "badge": "Tono",
            "html": "Amigable, confiado y natural. Como si respondiera una persona real, no una empresa."
          }
        ],
        "tip": "💡 Cerrar con una pregunta aumenta mucho las chances de que el cliente responda."
      },
      {
        "label": "WhatsApp · Seguimiento",
        "title": "Mensaje a cliente que no respondió",
        "sections": [
          {
            "type": "ps-rol",
            "badge": "Rol",
            "html": "Actuá como un especialista en ventas consultivas para emprendedores."
          },
          {
            "type": "ps-ctx",
            "badge": "Contexto",
            "html": "Le mandé información a un cliente hace <em class=\"ph\">[cuántos días]</em> días sobre <em class=\"ph\">[producto o servicio]</em> y no respondió."
          },
          {
            "type": "ps-task",
            "badge": "Tarea",
            "html": "Escribime un mensaje de seguimiento para retomar la conversación sin sonar insistente."
          },
          {
            "type": "ps-fmt",
            "badge": "Formato",
            "html": "Máximo 2 oraciones. Sin emojis exagerados. Que sea breve y directo."
          },
          {
            "type": "ps-tone",
            "badge": "Tono",
            "html": "Natural y tranquilo, como si lo escribiera yo mismo/a. Nada de presión ni desesperación."
          }
        ],
        "tip": "💡 Esperá al menos 2-3 días antes de hacer seguimiento. Un solo mensaje es suficiente."
      },
      {
        "label": "WhatsApp / Redes · Gestión de conflictos",
        "title": "Responder un reclamo o queja de cliente",
        "sections": [
          {
            "type": "ps-rol",
            "badge": "Rol",
            "html": "Actuá como un experto en atención al cliente y gestión de conflictos para pequeños emprendimientos."
          },
          {
            "type": "ps-ctx",
            "badge": "Contexto",
            "html": "Un cliente hizo la siguiente queja: \"<em class=\"ph\">[copiá la queja]</em>\". Lo que ocurrió realmente fue: <em class=\"ph\">[tu versión de la situación]</em>."
          },
          {
            "type": "ps-task",
            "badge": "Tarea",
            "html": "Escribime una respuesta profesional a ese reclamo que reconozca la molestia y proponga una solución concreta."
          },
          {
            "type": "ps-fmt",
            "badge": "Formato",
            "html": "4 oraciones como máximo: una que reconozca la molestia, una breve explicación y una propuesta de solución concreta."
          },
          {
            "type": "ps-tone",
            "badge": "Tono",
            "html": "Calmado, empático y respetuoso. Sin sonar defensivo/a ni pedir disculpas en exceso."
          }
        ],
        "tip": "💡 Responder bien un reclamo puede convertir a un cliente insatisfecho en uno fiel."
      },
      {
        "label": "WhatsApp Business · Catálogo",
        "title": "Descripción de producto para el catálogo",
        "sections": [
          {
            "type": "ps-rol",
            "badge": "Rol",
            "html": "Actuá como un copywriter especializado en ventas para emprendedores."
          },
          {
            "type": "ps-ctx",
            "badge": "Contexto",
            "html": "Tengo un emprendimiento de <em class=\"ph\">[rubro]</em> y quiero agregar este producto al catálogo de WhatsApp Business: <em class=\"ph\">[nombre y descripción básica]</em>. Precio: <em class=\"ph\">[precio]</em>. Beneficios principales: <em class=\"ph\">[enumerá 2 o 3 ventajas]</em>."
          },
          {
            "type": "ps-task",
            "badge": "Tarea",
            "html": "Escribime la descripción del producto para el catálogo."
          },
          {
            "type": "ps-fmt",
            "badge": "Formato",
            "html": "Máximo 3 líneas (respetá el límite de 300 caracteres de WhatsApp Business). Resaltá el beneficio para el cliente, no solo las características."
          },
          {
            "type": "ps-tone",
            "badge": "Tono",
            "html": "Cercano y que invite a consultar más. Nada de lenguaje comercial genérico."
          }
        ],
        "tip": "💡 WhatsApp Business permite hasta 300 caracteres en la descripción de cada producto."
      }
    ]
  },
  {
    "key": "marca",
    "emoji": "✨",
    "title": "Identidad de Marca",
    "extras": [],
    "cards": [
      {
        "label": "Marca · Estrategia",
        "title": "Definir la propuesta de valor en una frase",
        "sections": [
          {
            "type": "ps-rol",
            "badge": "Rol",
            "html": "Actuá como un consultor de branding y estrategia para pequeños emprendimientos."
          },
          {
            "type": "ps-ctx",
            "badge": "Contexto",
            "html": "Tengo un emprendimiento de <em class=\"ph\">[rubro]</em> llamado <em class=\"ph\">[nombre]</em>. Vendo <em class=\"ph\">[producto o servicio]</em> para <em class=\"ph\">[quiénes son mis clientes]</em>. A diferencia de otros en mi rubro, yo <em class=\"ph\">[qué hacés distinto: entrega a domicilio, personalización, precio, calidad, etc.]</em>."
          },
          {
            "type": "ps-task",
            "badge": "Tarea",
            "html": "Ayudame a escribir mi propuesta de valor: la frase que explica por qué alguien debería elegirme a mí."
          },
          {
            "type": "ps-fmt",
            "badge": "Formato",
            "html": "Dame 3 opciones de una sola frase, con un máximo de 20 palabras cada una."
          },
          {
            "type": "ps-tone",
            "badge": "Tono",
            "html": "Directo, claro y memorable. Sin tecnicismos ni palabras vacías como \"calidad\" o \"excelencia\"."
          }
        ],
        "tip": "💡 La propuesta de valor es lo primero que tenés que decir cuando alguien te pregunta qué hacés."
      },
      {
        "label": "Marca · Storytelling",
        "title": "Contar la historia de tu emprendimiento",
        "sections": [
          {
            "type": "ps-rol",
            "badge": "Rol",
            "html": "Actuá como un consultor de comunicación y storytelling para emprendedores."
          },
          {
            "type": "ps-ctx",
            "badge": "Contexto",
            "html": "Empecé mi emprendimiento porque <em class=\"ph\">[por qué o cómo nació la idea]</em>. Al principio fue difícil porque <em class=\"ph\">[un obstáculo real que tuviste]</em>. Hoy estoy orgulloso/a de <em class=\"ph\">[un logro concreto, aunque sea pequeño]</em>."
          },
          {
            "type": "ps-task",
            "badge": "Tarea",
            "html": "Redactame la historia de mi emprendimiento para publicar en Instagram o Facebook."
          },
          {
            "type": "ps-fmt",
            "badge": "Formato",
            "html": "3 párrafos cortos en primera persona. El primero que enganche, el segundo que muestre el desafío, el tercero que inspire."
          },
          {
            "type": "ps-tone",
            "badge": "Tono",
            "html": "Honesto, cercano y emotivo. Sin exagerar ni sonar a publicidad. Como si se lo contara a un conocido."
          }
        ],
        "tip": "💡 Las historias reales conectan mucho más que los textos de venta. No tengas miedo de mostrarte vulnerable."
      },
      {
        "label": "Marca · Naming",
        "title": "Ideas de nombre para tu emprendimiento",
        "sections": [
          {
            "type": "ps-rol",
            "badge": "Rol",
            "html": "Actuá como un especialista en naming y branding para emprendimientos emergentes."
          },
          {
            "type": "ps-ctx",
            "badge": "Contexto",
            "html": "Voy a lanzar un emprendimiento de <em class=\"ph\">[qué]</em>. Mi público son <em class=\"ph\">[quiénes]</em>. Los valores que quiero transmitir son <em class=\"ph\">[ej: calidez, modernidad, artesanal, confianza]</em>."
          },
          {
            "type": "ps-task",
            "badge": "Tarea",
            "html": "Generame opciones de nombres para mi emprendimiento que sean fáciles de recordar y pronunciar."
          },
          {
            "type": "ps-fmt",
            "badge": "Formato",
            "html": "10 opciones variadas: algunas en español, algunas en inglés, algunas inventadas. Para cada nombre, una línea breve explicando por qué funciona."
          },
          {
            "type": "ps-tone",
            "badge": "Tono",
            "html": "Creativo y variado. Evitá los nombres demasiado genéricos o que ya existan en el rubro."
          }
        ],
        "tip": "💡 Antes de quedarte con uno, buscalo en Instagram para ver si ya está tomado."
      },
      {
        "label": "Marca · Slogan",
        "title": "Slogan memorable para tu emprendimiento",
        "sections": [
          {
            "type": "ps-rol",
            "badge": "Rol",
            "html": "Actuá como un copywriter creativo especializado en identidad de marca para emprendedores."
          },
          {
            "type": "ps-ctx",
            "badge": "Contexto",
            "html": "Tengo un emprendimiento llamado \"<em class=\"ph\">[nombre del emprendimiento]</em>\" que se dedica a <em class=\"ph\">[qué hace]</em>. La sensación que quiero transmitir es <em class=\"ph\">[ej: confianza, alegría, exclusividad, cercanía]</em>."
          },
          {
            "type": "ps-task",
            "badge": "Tarea",
            "html": "Creame opciones de slogan para mi emprendimiento."
          },
          {
            "type": "ps-fmt",
            "badge": "Formato",
            "html": "5 opciones numeradas, una por línea. Solo el slogan, sin explicaciones."
          },
          {
            "type": "ps-tone",
            "badge": "Tono",
            "html": "Creativo, en español rioplatense. Cortos, fáciles de recordar y que suenen auténticos."
          }
        ],
        "tip": "💡 El mejor slogan es el que el propio cliente repite cuando te recomienda."
      }
    ]
  },
  {
    "key": "contenido",
    "emoji": "📅",
    "title": "Planificación de Contenido",
    "extras": [],
    "cards": [
      {
        "label": "Contenido · Calendario",
        "title": "Plan de publicaciones para la semana",
        "sections": [
          {
            "type": "ps-rol",
            "badge": "Rol",
            "html": "Actuá como un estratega de contenidos para redes sociales de pequeños emprendimientos."
          },
          {
            "type": "ps-ctx",
            "badge": "Contexto",
            "html": "Tengo un emprendimiento de <em class=\"ph\">[rubro]</em> y quiero publicar <em class=\"ph\">[cuántas veces por semana: 2 / 3 / 5]</em> veces en <em class=\"ph\">[Instagram / Facebook / ambas]</em>. Esta semana quiero destacar: <em class=\"ph\">[ej: producto estrella, una promo, una fecha especial]</em>."
          },
          {
            "type": "ps-task",
            "badge": "Tarea",
            "html": "Haceme un plan de publicaciones para esta semana."
          },
          {
            "type": "ps-fmt",
            "badge": "Formato",
            "html": "Una lista por día con: tema de la publicación, tipo de formato (foto, carrusel, historia, reel) y una frase de arranque para el texto."
          },
          {
            "type": "ps-tone",
            "badge": "Tono",
            "html": "Práctico y directo. Sin explicaciones largas, solo el plan listo para usar."
          }
        ],
        "tip": "💡 Planificar el lunes toda la semana te ahorra mucho estrés y hace que tus redes se vean más consistentes."
      },
      {
        "label": "Contenido · Ideas",
        "title": "20 ideas de publicaciones para tu rubro",
        "sections": [
          {
            "type": "ps-rol",
            "badge": "Rol",
            "html": "Actuá como un estratega de contenidos especializado en marketing para emprendedores."
          },
          {
            "type": "ps-ctx",
            "badge": "Contexto",
            "html": "Tengo un emprendimiento de <em class=\"ph\">[rubro, ej: comida casera / ropa / bijouterie / servicios de limpieza]</em> y mis clientes son <em class=\"ph\">[quiénes]</em>."
          },
          {
            "type": "ps-task",
            "badge": "Tarea",
            "html": "Generame 20 ideas de publicaciones para Instagram y Facebook que no sean solo fotos de productos."
          },
          {
            "type": "ps-fmt",
            "badge": "Formato",
            "html": "Lista numerada organizada por tipo: consejos útiles, detrás de escena, preguntas para generar interacción, testimonios, fechas especiales y educación sobre el rubro."
          },
          {
            "type": "ps-tone",
            "badge": "Tono",
            "html": "Práctico y aplicable desde ya. Ideas concretas, no conceptos vagos."
          }
        ],
        "tip": "💡 Guardá esta lista y usala cada vez que no sepas qué publicar."
      },
      {
        "label": "Contenido · Fecha especial",
        "title": "Publicación para aprovechar una fecha del año",
        "sections": [
          {
            "type": "ps-rol",
            "badge": "Rol",
            "html": "Actuá como un community manager experto en marketing estacional para emprendimientos."
          },
          {
            "type": "ps-ctx",
            "badge": "Contexto",
            "html": "Se viene <em class=\"ph\">[nombre de la fecha: Día de la Madre, Navidad, vuelta al cole, etc.]</em> y tengo un emprendimiento de <em class=\"ph\">[rubro]</em>."
          },
          {
            "type": "ps-task",
            "badge": "Tarea",
            "html": "Escribime el texto para una publicación que aproveche esa fecha sin ser solo publicidad."
          },
          {
            "type": "ps-fmt",
            "badge": "Formato",
            "html": "Texto de máximo 3 párrafos. Al final, sugerí qué tipo de imagen o diseño iría bien."
          },
          {
            "type": "ps-tone",
            "badge": "Tono",
            "html": "Emotivo o celebratorio según la fecha. Que sea útil o significativo para mi comunidad, no solo comercial."
          }
        ],
        "tip": "💡 Publicar 3-5 días antes de la fecha tiene más impacto que hacerlo el mismo día."
      },
      {
        "label": "Contenido · Video",
        "title": "Guión para un Reel de 30 segundos",
        "sections": [
          {
            "type": "ps-rol",
            "badge": "Rol",
            "html": "Actuá como un productor de contenido audiovisual para redes sociales de pequeños emprendimientos."
          },
          {
            "type": "ps-ctx",
            "badge": "Contexto",
            "html": "Quiero hacer un Reel de Instagram de 30 segundos para mi emprendimiento de <em class=\"ph\">[rubro]</em>, mostrando <em class=\"ph\">[qué querés mostrar: cómo se hace tu producto, una transformación, un tutorial rápido, etc.]</em>."
          },
          {
            "type": "ps-task",
            "badge": "Tarea",
            "html": "Escribime el guión completo del Reel."
          },
          {
            "type": "ps-fmt",
            "badge": "Formato",
            "html": "Dividido en 5-6 escenas. Para cada escena: qué se graba, qué texto aparece en pantalla y cuántos segundos dura. Incluí una frase gancho para los primeros 2 segundos."
          },
          {
            "type": "ps-tone",
            "badge": "Tono",
            "html": "Dinámico y llamativo. Que lo pueda grabar yo solo/a con el celular, sin producción profesional."
          }
        ],
        "tip": "💡 Los primeros 2 segundos son los más importantes — si no enganchás ahí, la gente se va."
      }
    ]
  },
  {
    "key": "textos",
    "emoji": "✍️",
    "title": "Textos y Descripciones",
    "extras": [],
    "cards": [
      {
        "label": "Textos · Copywriting",
        "title": "Descripción persuasiva de un producto o servicio",
        "sections": [
          {
            "type": "ps-rol",
            "badge": "Rol",
            "html": "Actuá como un copywriter especializado en descripciones de productos para emprendedores."
          },
          {
            "type": "ps-ctx",
            "badge": "Contexto",
            "html": "Tengo un emprendimiento de <em class=\"ph\">[rubro]</em> y quiero describir: <em class=\"ph\">[nombre del producto]</em>. Características: <em class=\"ph\">[las más importantes]</em>. Para quién es ideal: <em class=\"ph\">[tu cliente tipo]</em>. Precio: <em class=\"ph\">[precio]</em>."
          },
          {
            "type": "ps-task",
            "badge": "Tarea",
            "html": "Escribime una descripción persuasiva de ese producto que resalte el beneficio para el cliente, no solo las características técnicas."
          },
          {
            "type": "ps-fmt",
            "badge": "Formato",
            "html": "Máximo 5 líneas. Que empiece con el beneficio principal, no con el nombre del producto."
          },
          {
            "type": "ps-tone",
            "badge": "Tono",
            "html": "<em class=\"ph\">[cálido / profesional / entusiasta]</em>. Auténtico, sin frases vacías como \"de la más alta calidad\"."
          }
        ],
        "tip": "💡 La diferencia entre \"torta de 3 pisos\" y \"torta que convierte cualquier cumpleaños en un momento único\" es enorme."
      },
      {
        "label": "Textos · Comunicación formal",
        "title": "Mensaje formal para una institución o proveedor",
        "sections": [
          {
            "type": "ps-rol",
            "badge": "Rol",
            "html": "Actuá como un especialista en comunicación institucional para emprendimientos."
          },
          {
            "type": "ps-ctx",
            "badge": "Contexto",
            "html": "Soy <em class=\"ph\">[tu nombre]</em>, emprendedor/a de <em class=\"ph\">[rubro]</em> con un emprendimiento llamado <em class=\"ph\">[nombre]</em>. Necesito escribirle a <em class=\"ph\">[a quién: municipio, feria, proveedor, institución]</em>."
          },
          {
            "type": "ps-task",
            "badge": "Tarea",
            "html": "Redactame un mensaje formal para <em class=\"ph\">[para qué: inscribirme, pedir información, presentar mi emprendimiento, hacer una consulta]</em>."
          },
          {
            "type": "ps-fmt",
            "badge": "Formato",
            "html": "Estructura de carta o mail: saludo formal, cuerpo en 2-3 párrafos concisos, cierre y firma."
          },
          {
            "type": "ps-tone",
            "badge": "Tono",
            "html": "Formal pero sin ser frío. Claro, respetuoso y profesional."
          }
        ],
        "tip": "💡 Un mensaje bien redactado puede ser la diferencia entre que te respondan o no."
      },
      {
        "label": "Textos · Prueba social",
        "title": "Convertir comentario de cliente en testimonio",
        "sections": [
          {
            "type": "ps-rol",
            "badge": "Rol",
            "html": "Actuá como un copywriter especializado en prueba social y testimonios para emprendimientos."
          },
          {
            "type": "ps-ctx",
            "badge": "Contexto",
            "html": "Un cliente me dijo esto sobre mi producto/servicio: \"<em class=\"ph\">[copiá el comentario tal cual, aunque esté informal o con errores]</em>\"."
          },
          {
            "type": "ps-task",
            "badge": "Tarea",
            "html": "Reescribilo como un testimonio corto para publicar en redes."
          },
          {
            "type": "ps-fmt",
            "badge": "Formato",
            "html": "Máximo 3 oraciones. Entre comillas, como si lo dijera el cliente."
          },
          {
            "type": "ps-tone",
            "badge": "Tono",
            "html": "Auténtico y creíble. Sin exagerar. No agregues información que el cliente no haya mencionado."
          }
        ],
        "tip": "💡 Siempre pedile permiso al cliente antes de publicar su testimonio."
      },
      {
        "label": "Textos · Comunicación de precios",
        "title": "Anunciar un aumento de precios",
        "sections": [
          {
            "type": "ps-rol",
            "badge": "Rol",
            "html": "Actuá como un consultor de comunicación de precios para pequeños emprendimientos."
          },
          {
            "type": "ps-ctx",
            "badge": "Contexto",
            "html": "Voy a subir mis precios porque <em class=\"ph\">[ej: suba de insumos, inflación, mejoras en el producto]</em>. El aumento es de aproximadamente <em class=\"ph\">[porcentaje o de X a Y pesos]</em>."
          },
          {
            "type": "ps-task",
            "badge": "Tarea",
            "html": "Escribime un mensaje para comunicar el aumento a mis clientes, para publicar en redes o enviar por WhatsApp."
          },
          {
            "type": "ps-fmt",
            "badge": "Formato",
            "html": "Máximo 4 oraciones. Directo, que no dé vueltas innecesarias."
          },
          {
            "type": "ps-tone",
            "badge": "Tono",
            "html": "Honesto y respetuoso. Sin pedir disculpas en exceso ni justificarse demasiado. Que mantenga la confianza del cliente."
          }
        ],
        "tip": "💡 Comunicar los aumentos con anticipación y transparencia genera mucho más respeto que subirlos sin avisar."
      }
    ]
  },
  {
    "key": "wabiz",
    "emoji": "📲",
    "title": "WhatsApp Business — Mensajes Automáticos",
    "extras": [
      "<div class=\"what-box\" style=\"background:rgba(0,255,136,0.06);border:1px solid rgba(0,255,136,0.22);margin-bottom:1rem;border-radius:4px;padding:1rem 1.2rem;display:flex;gap:0.8rem;\">\n    <span style=\"font-size:1.5rem;flex-shrink:0\">💡</span>\n    <div>\n      <p style=\"font-size:0.83rem;color:#94a3b8;line-height:1.6;\"><strong style=\"color:#00ff88\">¿Cómo usar estos prompts?</strong> Generá el texto con la IA, luego pegalo directamente en WhatsApp Business: <strong style=\"color:#cbd5e1\">Ajustes → Herramientas para la empresa → Mensaje de bienvenida / ausencia / respuestas rápidas</strong>.</p>\n    </div>\n  </div>"
    ],
    "cards": [
      {
        "label": "WhatsApp Business · Mensaje de bienvenida",
        "title": "Primer mensaje automático cuando alguien te escribe",
        "sections": [
          {
            "type": "ps-rol",
            "badge": "Rol",
            "html": "Actuá como un especialista en comunicación digital para pequeños emprendimientos."
          },
          {
            "type": "ps-ctx",
            "badge": "Contexto",
            "html": "Tengo un emprendimiento de <em class=\"ph\">[rubro]</em> llamado <em class=\"ph\">[nombre]</em>. Ofrezco <em class=\"ph\">[qué vendés o qué servicio das]</em>. Mi horario de atención es <em class=\"ph\">[ej: lunes a viernes de 9 a 18hs]</em>."
          },
          {
            "type": "ps-task",
            "badge": "Tarea",
            "html": "Escribime el mensaje de bienvenida automático de WhatsApp Business que se envía cuando alguien me escribe por primera vez o después de 14 días sin contacto."
          },
          {
            "type": "ps-fmt",
            "badge": "Formato",
            "html": "Máximo 3 oraciones. Que salude, presente brevemente el emprendimiento y le diga al cliente que en breve lo atienden. Sin listas ni emojis exagerados."
          },
          {
            "type": "ps-tone",
            "badge": "Tono",
            "html": "Cálido y profesional. Que transmita confianza desde el primer contacto."
          }
        ],
        "tip": "💡 En WhatsApp Business: Ajustes → Herramientas para la empresa → Mensaje de bienvenida."
      },
      {
        "label": "WhatsApp Business · Mensaje de ausencia",
        "title": "Respuesta automática fuera del horario de atención",
        "sections": [
          {
            "type": "ps-rol",
            "badge": "Rol",
            "html": "Actuá como un especialista en atención al cliente para pequeños emprendimientos."
          },
          {
            "type": "ps-ctx",
            "badge": "Contexto",
            "html": "Tengo un emprendimiento de <em class=\"ph\">[rubro]</em> llamado <em class=\"ph\">[nombre]</em>. Mi horario de atención es <em class=\"ph\">[ej: lunes a viernes de 9 a 18hs]</em>. Fuera de ese horario no puedo responder de inmediato."
          },
          {
            "type": "ps-task",
            "badge": "Tarea",
            "html": "Escribime el mensaje de ausencia automático que se envía cuando alguien me escribe fuera de mi horario de atención."
          },
          {
            "type": "ps-fmt",
            "badge": "Formato",
            "html": "Máximo 3 oraciones. Que informe que no estoy disponible en ese momento, indique el horario en que van a recibir respuesta y cierre con algo que no los haga sentir ignorados."
          },
          {
            "type": "ps-tone",
            "badge": "Tono",
            "html": "Amable y tranquilizador. Que el cliente sienta que va a ser atendido, solo que después."
          }
        ],
        "tip": "💡 Podés programarlo para que se active solo en ciertos horarios y días desde la app."
      },
      {
        "label": "WhatsApp Business · Respuesta rápida",
        "title": "Respuesta a \"¿Cuánto cuesta?\" / \"¿Tienen precio?\"",
        "sections": [
          {
            "type": "ps-rol",
            "badge": "Rol",
            "html": "Actuá como un especialista en ventas y comunicación para pequeños emprendimientos."
          },
          {
            "type": "ps-ctx",
            "badge": "Contexto",
            "html": "Tengo un emprendimiento de <em class=\"ph\">[rubro]</em>. Mis productos/servicios van desde <em class=\"ph\">[precio mínimo]</em> hasta <em class=\"ph\">[precio máximo]</em>. <em class=\"ph\">[Opcional: mencioná si tenés catálogo, lista de precios o si los precios varían según el pedido]</em>."
          },
          {
            "type": "ps-task",
            "badge": "Tarea",
            "html": "Escribime una respuesta rápida para WhatsApp Business para responder de forma instantánea cuando alguien pregunta por precios."
          },
          {
            "type": "ps-fmt",
            "badge": "Formato",
            "html": "Máximo 4 oraciones. Que dé una idea de rango de precios, invite a ver el catálogo o pedir más info, y cierre con una pregunta para seguir la conversación."
          },
          {
            "type": "ps-tone",
            "badge": "Tono",
            "html": "Directo y amigable. Sin esquivar la pregunta ni dar una respuesta que genere frustración."
          }
        ],
        "tip": "💡 En WhatsApp Business guardás esto como respuesta rápida con el atajo /precio y la enviás con un solo toque."
      },
      {
        "label": "WhatsApp Business · Respuesta rápida",
        "title": "Respuesta a \"¿Hacen envíos?\" / \"¿Cómo compro?\"",
        "sections": [
          {
            "type": "ps-rol",
            "badge": "Rol",
            "html": "Actuá como un especialista en ventas y logística para pequeños emprendimientos."
          },
          {
            "type": "ps-ctx",
            "badge": "Contexto",
            "html": "Tengo un emprendimiento de <em class=\"ph\">[rubro]</em>. <em class=\"ph\">[Describí cómo funciona tu venta: hacés envíos / solo retiro en persona / ambos / zona de cobertura / costo del envío / forma de pago]</em>."
          },
          {
            "type": "ps-task",
            "badge": "Tarea",
            "html": "Escribime una respuesta rápida explicando cómo funciona la compra y el envío en mi emprendimiento."
          },
          {
            "type": "ps-fmt",
            "badge": "Formato",
            "html": "Máximo 5 líneas. Puede tener una pequeña lista con íconos si hace más fácil la lectura. Cerrar invitando a coordinar el pedido."
          },
          {
            "type": "ps-tone",
            "badge": "Tono",
            "html": "Claro y práctico. Que el cliente entienda el proceso en 10 segundos sin necesidad de preguntar más."
          }
        ],
        "tip": "💡 Guardalo con el atajo /envio para enviarlo con un toque cada vez que te pregunten."
      },
      {
        "label": "WhatsApp Business · Respuesta rápida",
        "title": "Confirmación de pedido recibido",
        "sections": [
          {
            "type": "ps-rol",
            "badge": "Rol",
            "html": "Actuá como un especialista en atención postventa para pequeños emprendimientos."
          },
          {
            "type": "ps-ctx",
            "badge": "Contexto",
            "html": "Tengo un emprendimiento de <em class=\"ph\">[rubro]</em>. Cuando un cliente confirma un pedido, necesito enviarle un mensaje que lo tranquilice y le informe los pasos siguientes. El tiempo de preparación suele ser <em class=\"ph\">[ej: 24hs / 2-3 días / en el momento]</em>."
          },
          {
            "type": "ps-task",
            "badge": "Tarea",
            "html": "Escribime un mensaje de confirmación de pedido para enviarle al cliente una vez que confirma su compra."
          },
          {
            "type": "ps-fmt",
            "badge": "Formato",
            "html": "Máximo 4 oraciones. Que confirme que recibiste el pedido, informe el tiempo estimado y el próximo paso (pago, preparación, envío), y cierre agradeciéndole la confianza."
          },
          {
            "type": "ps-tone",
            "badge": "Tono",
            "html": "Cálido y profesional. Que el cliente sienta que está en buenas manos y su pedido está bajo control."
          }
        ],
        "tip": "💡 Este mensaje reduce muchísimo las consultas ansiosas de \"¿llegó mi pedido?\" porque el cliente ya sabe qué esperar."
      },
      {
        "label": "WhatsApp Business · Perfil",
        "title": "Descripción del emprendimiento para el perfil de WhatsApp Business",
        "sections": [
          {
            "type": "ps-rol",
            "badge": "Rol",
            "html": "Actuá como un copywriter especializado en perfiles digitales para emprendedores."
          },
          {
            "type": "ps-ctx",
            "badge": "Contexto",
            "html": "Tengo un emprendimiento llamado <em class=\"ph\">[nombre]</em> que se dedica a <em class=\"ph\">[qué hacés]</em>. Mi diferencial es <em class=\"ph\">[qué te hace único/a]</em>. Mi zona de atención es <em class=\"ph\">[ciudad o zona]</em> y mi horario es <em class=\"ph\">[horario]</em>."
          },
          {
            "type": "ps-task",
            "badge": "Tarea",
            "html": "Escribime la descripción para el perfil de WhatsApp Business que van a ver los clientes cuando entren a mi contacto."
          },
          {
            "type": "ps-fmt",
            "badge": "Formato",
            "html": "Máximo 139 caracteres (límite de WhatsApp Business). Una sola frase que diga qué hacés, para quién y qué te diferencia."
          },
          {
            "type": "ps-tone",
            "badge": "Tono",
            "html": "Claro y directo. Que en menos de 5 segundos el cliente entienda de qué trata el emprendimiento."
          }
        ],
        "tip": "💡 Esta descripción aparece debajo del nombre de tu emprendimiento cuando alguien te guarda o busca en WhatsApp."
      }
    ]
  },
  {
    "key": "tiendanube",
    "emoji": "🛒",
    "title": "Tiendanube",
    "extras": [
      "<div class=\"what-box\" style=\"background:rgba(0,212,255,0.06);border:1px solid rgba(0,212,255,0.3);margin-bottom:1rem;border-radius:4px;padding:1rem 1.2rem;display:flex;gap:0.8rem;\">\n    <span style=\"font-size:1.5rem;flex-shrink:0\">💡</span>\n    <div>\n      <p style=\"font-size:0.83rem;color:#94a3b8;line-height:1.6;\"><strong style=\"color:#00d4ff\">¿Cómo usar estos prompts?</strong> Generá el texto con la IA y pegalo directamente en el panel de Tiendanube: <strong style=\"color:#cbd5e1\">Productos → Editar → Descripción</strong>, o en <strong style=\"color:#cbd5e1\">Configuración → Página \"Sobre nosotros\"</strong>, según el caso.</p>\n    </div>\n  </div>"
    ],
    "cards": [
      {
        "label": "Tiendanube · Producto",
        "title": "Descripción de producto que vende (con SEO)",
        "sections": [
          {
            "type": "ps-rol",
            "badge": "Rol",
            "html": "Actuá como un copywriter especializado en e-commerce para emprendimientos de Argentina."
          },
          {
            "type": "ps-ctx",
            "badge": "Contexto",
            "html": "Tengo una tienda en Tiendanube de <em class=\"ph\">[rubro]</em>. El producto es: <em class=\"ph\">[nombre del producto]</em>. Sus características principales son: <em class=\"ph\">[materiales, medidas, colores, peso, etc.]</em>. El beneficio clave para el cliente es: <em class=\"ph\">[qué problema resuelve o qué sensación genera]</em>."
          },
          {
            "type": "ps-task",
            "badge": "Tarea",
            "html": "Escribime la descripción del producto para mi tienda. Tiene que convencer al cliente de comprarlo y aparecer bien en Google."
          },
          {
            "type": "ps-fmt",
            "badge": "Formato",
            "html": "Un párrafo de 2-3 oraciones que engancha, seguido de una lista de 4-5 características con beneficios (no solo specs técnicas). Total: no más de 150 palabras."
          },
          {
            "type": "ps-tone",
            "badge": "Tono",
            "html": "Cercano y confiable. Que suene como una persona que recomienda el producto, no como un catálogo técnico."
          }
        ],
        "tip": "💡 Una buena descripción reduce las preguntas por WhatsApp y mejora el posicionamiento en Google de tu tienda."
      },
      {
        "label": "Tiendanube · Página institucional",
        "title": "Texto para la página \"Sobre nosotros\" / \"Quiénes somos\"",
        "sections": [
          {
            "type": "ps-rol",
            "badge": "Rol",
            "html": "Actuá como un redactor especializado en páginas institucionales para tiendas online de emprendedores."
          },
          {
            "type": "ps-ctx",
            "badge": "Contexto",
            "html": "Tengo una tienda en Tiendanube llamada <em class=\"ph\">[nombre]</em> que vende <em class=\"ph\">[qué]</em>. Empecé porque <em class=\"ph\">[motivo o historia breve]</em>. Mis clientes son principalmente <em class=\"ph\">[quiénes]</em> y lo que me diferencia es <em class=\"ph\">[diferencial]</em>."
          },
          {
            "type": "ps-task",
            "badge": "Tarea",
            "html": "Escribime el texto para la sección \"Quiénes somos\" de mi tienda online."
          },
          {
            "type": "ps-fmt",
            "badge": "Formato",
            "html": "3 párrafos cortos: el primero presenta la tienda, el segundo cuenta el origen o motivación, el tercero dice qué puede esperar el cliente. Máximo 120 palabras en total."
          },
          {
            "type": "ps-tone",
            "badge": "Tono",
            "html": "Humano y cercano. Que el cliente sienta que hay una persona real detrás de la tienda, no una empresa impersonal."
          }
        ],
        "tip": "💡 Las tiendas que muestran la historia real del emprendedor generan más confianza y convierten mejor."
      },
      {
        "label": "Tiendanube · Políticas",
        "title": "Política de envíos, cambios y devoluciones",
        "sections": [
          {
            "type": "ps-rol",
            "badge": "Rol",
            "html": "Actuá como un especialista en atención al cliente para tiendas online de pequeños emprendimientos en Argentina."
          },
          {
            "type": "ps-ctx",
            "badge": "Contexto",
            "html": "Tengo una tienda en Tiendanube de <em class=\"ph\">[rubro]</em>. Mis condiciones son: envíos <em class=\"ph\">[ej: por Correo Argentino / OCA / Andreani / retiro en persona / envío gratis a partir de $X]</em>. Los cambios <em class=\"ph\">[se aceptan / no se aceptan / solo por producto defectuoso]</em> dentro de <em class=\"ph\">[X días]</em>. Devoluciones: <em class=\"ph\">[cómo las manejás]</em>."
          },
          {
            "type": "ps-task",
            "badge": "Tarea",
            "html": "Redactame el texto para la sección de políticas de envío, cambios y devoluciones de mi tienda."
          },
          {
            "type": "ps-fmt",
            "badge": "Formato",
            "html": "3 bloques bien separados con título (Envíos / Cambios / Devoluciones). Cada uno en 3-4 oraciones claras. Sin lenguaje legal complicado."
          },
          {
            "type": "ps-tone",
            "badge": "Tono",
            "html": "Claro y directo. Que el cliente entienda las reglas sin sentirse amenazado ni confundido."
          }
        ],
        "tip": "💡 Tener políticas claras visibles en la tienda reduce reclamos y genera más confianza para comprar."
      },
      {
        "label": "Tiendanube · Email automático",
        "title": "Email de recuperación de carrito abandonado",
        "sections": [
          {
            "type": "ps-rol",
            "badge": "Rol",
            "html": "Actuá como un especialista en email marketing para tiendas online de Argentina."
          },
          {
            "type": "ps-ctx",
            "badge": "Contexto",
            "html": "Tengo una tienda en Tiendanube de <em class=\"ph\">[rubro]</em>. Quiero activar el email automático de carrito abandonado que envía Tiendanube cuando alguien deja productos en el carrito sin comprar. <em class=\"ph\">[Opcional: ¿vas a ofrecer un descuento? ¿cuánto?]</em>"
          },
          {
            "type": "ps-task",
            "badge": "Tarea",
            "html": "Escribime el texto para el email de carrito abandonado que voy a configurar en Tiendanube."
          },
          {
            "type": "ps-fmt",
            "badge": "Formato",
            "html": "Asunto del email (máximo 8 palabras). Cuerpo: saludo + recordatorio del carrito + 1 frase motivadora + llamado a la acción. Máximo 80 palabras en total."
          },
          {
            "type": "ps-tone",
            "badge": "Tono",
            "html": "Amigable y sin presión. Que suene a un recordatorio útil, no a publicidad desesperada."
          }
        ],
        "tip": "💡 En Tiendanube: Panel → Marketing → Emails automáticos → Carrito abandonado. Activarlo puede recuperar hasta un 15% de ventas perdidas."
      },
      {
        "label": "Tiendanube · Pop-up / Banner",
        "title": "Texto para pop-up de descuento por primera compra",
        "sections": [
          {
            "type": "ps-rol",
            "badge": "Rol",
            "html": "Actuá como un especialista en conversión para tiendas online de emprendedores."
          },
          {
            "type": "ps-ctx",
            "badge": "Contexto",
            "html": "Tengo una tienda en Tiendanube de <em class=\"ph\">[rubro]</em>. Quiero mostrar un pop-up a los visitantes nuevos ofreciéndoles un descuento del <em class=\"ph\">[%]</em> en su primera compra a cambio de que dejen su email."
          },
          {
            "type": "ps-task",
            "badge": "Tarea",
            "html": "Escribime el texto del pop-up de bienvenida y descuento para mi tienda."
          },
          {
            "type": "ps-fmt",
            "badge": "Formato",
            "html": "Título impactante (máximo 6 palabras) + 1 oración que explica el beneficio + 1 línea que indica qué tienen que hacer (dejar el email). Sin más de 30 palabras en total."
          },
          {
            "type": "ps-tone",
            "badge": "Tono",
            "html": "Directo y tentador. Que dé ganas de aprovechar la oportunidad sin sentirse acosado."
          }
        ],
        "tip": "💡 En Tiendanube: Panel → Marketing → Pop-up de suscripción. Capturar emails es uno de los activos más valiosos de tu tienda."
      }
    ]
  }
];
window.renderPromptCatalog = function(categories){return categories.map(c=>`<section class="category" data-cat="${c.key}"><div class="category-header"><span class="cat-emoji">${c.emoji}</span><span class="cat-title">${c.title}</span><span class="cat-count">${c.cards.length} prompts</span></div>${c.extras.join('')}${c.cards.map(x=>`<article class="prompt-card"><div class="prompt-header"><div class="prompt-label">${x.label}</div><div class="prompt-title">${x.title}</div></div><div class="prompt-sections">${x.sections.map(q=>`<div class="ps ${q.type}"><span class="ps-badge">${q.badge}</span><span class="ps-text">${q.html}</span></div>`).join('')}</div><div class="prompt-footer"><div class="prompt-tip">${x.tip}</div><button class="copy-btn" data-action="copy-prompt">&#128203; Copiar</button></div></article>`).join('')}</section>`).join('')};
