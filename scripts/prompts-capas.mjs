// Texto exato enviado ao Gemini para cada capa de template.
//
// Este arquivo é a fonte da verdade; `docs/capas-dos-templates.md` é a versão
// para ler, com a explicação em português de cada escolha. Se mudar aqui,
// mude lá — e vice-versa.

/**
 * Vai colado no fim de todo prompt.
 *
 * Já tentei duas vezes empurrar o assunto para cima só com texto ("terço
 * superior", depois "metade de cima") e o modelo continuou centralizando. Quem
 * resolve a posição agora é o `desenharCapa()` do render: ele corta uma fatia
 * do topo e ancora o centro da foto acima do bloco de texto.
 *
 * Por isso aqui o pedido voltou a ser uma composição normal, centralizada — é
 * o que o modelo faz bem. A única exigência é margem: o render descarta os
 * ~15% de cima e o véu escuro cobre os ~15% de baixo, então nada essencial
 * pode encostar nas bordas horizontais.
 */
export const BLOCO_TECNICO = `
Vertical 4:5 composition. Photorealistic editorial photograph, full-frame
camera, natural film grain.

FRAMING: centre the main subject in the frame, at a comfortable distance —
not a tight crop. Leave breathing room at the top and bottom edges: the top
15% and the bottom 15% of the image are trimmed in layout, so no face, no
product and no essential detail may touch either edge.

No text, letters, numbers, logos or watermarks anywhere in the image. No real
or recognizable public figures.`;

/**
 * Variante para a única capa em que a cena pede escrita à mão visível.
 *
 * O Flash Image não escreve de verdade — ele desenha algo com aparência de
 * escrita. A primeira capa de educação saiu com a lousa cheia de garrancho em
 * inglês ("Shroaktrate revolution", "in basrriline"). A única tática que dá
 * chance é pedir POUCAS palavras e GRANDES: duas palavras em letra de fôrma o
 * modelo às vezes acerta, um quadro de anotações nunca.
 *
 * Se mesmo assim vier torto, o caminho é o `GEMINI_IMAGE_MODEL` apontando para
 * um modelo Pro de imagem — desenhar texto é o diferencial dele. Exige
 * faturamento ativo no Google.
 */
export const BLOCO_TECNICO_COM_TEXTO = `
Vertical 4:5 composition. Photorealistic editorial photograph, full-frame
camera, natural film grain.

FRAMING: centre the main subject in the frame, at a comfortable distance —
not a tight crop. Leave breathing room at the top and bottom edges: the top
15% and the bottom 15% of the image are trimmed in layout, so no face, no
product and no essential detail may touch either edge.

The only writing allowed in the image is the Brazilian Portuguese wording
described in the scene, in large clean handwriting. Spell it exactly as
written. Nothing else may carry text: no other words, no notes, no numbers,
no logos, no watermarks. No real or recognizable public figures.`;

/** Ids que usam o bloco que permite escrita na cena. */
const COM_TEXTO = new Set(["educacao-professores"]);

export const PROMPTS = {
  insider: `A woman in her thirties sitting alone in a bare concrete studio, leaning back in a wooden chair, eyes closed, exhausted but composed. Loose sheets of paper suspended in mid-air around her, frozen in motion, concentrated in the upper half of the frame. Hard directional light from a single tall window on camera left, deep black shadows on the right. 35mm lens, slight motion blur on the papers. Desaturated grey and black grade.`,

  "inteligencia-artificial": `Extreme close-up of a modern processor chip seated on a dark unmarked circuit board, its square brushed-metal heat spreader centred in the frame. A hard amber light rakes in from camera left, glinting off rows of copper contacts and the fine tracks around the socket, everything beyond falling into total black. Faint dust suspended in the beam. 100mm macro, shallow focus on the near edge of the chip. Amber and near-black grade.`,

  advocacia: `A man in his fifties wearing a dark tailored suit, standing in a classic law library, one hand resting on a bookshelf, looking off camera with quiet authority. Warm tungsten lamp glow behind him creating a rim light along his shoulder. 85mm f/1.8, shallow depth of field, bookshelves dissolving into bokeh. Deep amber and near-black grade.`,

  "noticias-virais": `A young woman standing still in a crowded avenue at night while everyone around her moves in motion blur, looking past the camera. Neon signage reflecting on wet asphalt. 35mm, 1/15s shutter, handheld documentary feel. Yellow and amber neon against deep black.`,

  "academia-fitness": `An athlete resting between sets in a dark gym, forearms on knees, head down, breathing hard, sweat on the shoulders. Single hard lime-green light from high behind, chalk dust suspended in the beam. 50mm, low camera angle. Black background, green rim light as the only colour.`,

  "clinica-estetica": `A woman's face in three-quarter view, eyes lowered, luminous untouched skin, centred in the frame with her shoulders visible. Deep neutral backdrop. Single large softbox on camera right with gentle falloff. 85mm f/2, shallow focus on the cheekbone. Warm champagne and dark chocolate grade, the backdrop falling into shadow around her.`,

  nutricionista: `A nutritionist in a bright kitchen laughing mid-gesture while plating a colourful bowl, fresh herbs and vegetables scattered on the counter. Soft daylight from a large window behind her. 35mm, natural colour, greens dominant. Foreground counter falling into shadow.`,

  imobiliaria: `A couple seen from behind standing in an empty high-end apartment at dusk, looking out floor-to-ceiling windows at the city skyline. Warm golden light flooding in, long shadows across the bare floor. 24mm wide, architectural framing. Amber and deep brown grade.`,

  marketing: `A young person in profile in a dark room, face lit only by shifting purple and blue light, focused expression. Out-of-focus point lights behind. 85mm f/1.4, heavy bokeh. Violet and magenta grade over near-black.`,

  noticias: `A person standing on a night street checking a phone, face lit from below by the screen glow, blurred traffic light streaks behind. 50mm, shallow depth of field, urgent documentary feel. Cold blue background with a single red light source.`,

  dentistas: `A dentist in scrubs standing in a modern clinic, arms crossed, warm confident smile, blurred equipment behind. Clean even lighting. 50mm f/2. Cyan and white palette, background falling off to deep teal at the bottom of the frame.`,

  "medicos-hospitalar": `A doctor walking down a modern hospital corridor toward the camera, mid-stride, slightly soft focus. Cool blue light from ceiling panels, strong perspective lines. 50mm, shallow depth of field. Blue and steel grade, foreground floor in shadow.`,

  "beleza-estetica": `A woman having her hair worked on in an upscale salon, seen through a mirror reflection, calm expression, warm lamps glowing behind her. 50mm f/1.8, shallow depth of field. Dusty rose and deep wine grade.`,

  "educacao-professores": `A teacher in her thirties mid-explanation in a bright modern classroom, gesturing with one hand, genuinely animated and smiling. Behind her a clean white board carrying only two large hand-written words in Brazilian Portuguese: "REVOLUÇÃO INDUSTRIAL" — nothing else written anywhere. Contemporary school interior: pale walls, big clean windows flooding the room with daylight, light wood furniture. Two students seen from behind in the foreground, softly out of focus, attentive. 35mm, airy and open. Bright natural colour, warm yellow accents, no gloom.`,

  hamburgueria: `A handmade burger shot from a high three-quarter angle, centred on a dark wooden board. Melted cheese spilling down the side, steam rising, sesame bun glistening under a hard warm light from camera left. 100mm macro, very shallow depth of field. Ember orange and burnt brown grade, the board falling into darkness at the edges.`,

  pizzaria: `A pizzaiolo pulling a pizza out of a wood-fired oven on a long metal peel, flames visible inside the oven mouth, flour dust and sparks suspended in the air, face lit from below by the fire. 35mm, slight motion blur on the peel. Amber and deep black grade, everything below the oven in shadow.`,

  restaurante: `A beautifully plated dish shot from a high three-quarter angle, centred in the frame, on a dark restaurant table at night. A single warm pendant lamp above pours light straight onto the food, making it by far the brightest thing in the picture — glistening sauce, visible texture, steam rising. Cutlery and a wine glass out of focus at the edges. 50mm f/2. Copper and near-black grade, the table falling into darkness around the plate.`,

  "contabilidade-financeiro": `Close-up of an old mechanical calculator on a dark wooden desk, raking golden morning light from the left carving long shadows across the keys. 100mm macro, shallow focus on the key row. Deep green and gold grade, background dissolving into black.`,

  turismo: `A traveller standing on a coastal viewpoint at sunset, seen from behind, wind in their clothes, mountains meeting the sea ahead. Backlit by the low sun, soft lens flare. 35mm. Orange and teal grade, foreground rocks in deep shadow.`,

  pets: `A golden retriever sitting and looking up attentively at a hand just outside the frame, in a warm living room, late afternoon light through a window. 50mm f/1.8, shallow depth of field, camera at the dog's eye level. Caramel and amber grade, floor in shadow.`,

  "joias-semijoias": `A single fine gold chain draped over dark satin, one hard pin light raking across the metal creating a controlled specular highlight. 100mm macro, extreme shallow depth of field. Everything beyond the chain in complete black.`,

  "prompt-claro": `Close-up of a pair of hands poised over a slim modern keyboard on a pale wooden desk, caught in the instant before typing, centred in the frame. Morning daylight from a window on camera left, clean airy minimal desk. 50mm f/1.8, sharp on the hands with the keys falling into soft bokeh so no character is legible. Warm cream, pale wood and soft shadow.`,

  terapias: `A woman in her thirties sitting by a wide window in a quiet room, seen from the side, calm and composed, looking out. Soft diffused daylight through a sheer curtain, a plant out of focus behind her. 50mm f/2, gentle shallow focus. Muted sage green and deep forest grade, unhurried and still.`,

  manicure: `Close-up of a pair of well-groomed hands resting on a pale stone surface, freshly painted nails catching the light, fingers relaxed. Large soft studio light from above, clean minimal set. 100mm macro, shallow focus on the nails. Warm cream, soft pink and pale shadow — bright, airy, high key.`,

  moda: `A woman walking with purpose along an urban street, sharply tailored coat, caught mid-stride with the fabric still moving. Late afternoon backlight rimming her shoulders, the street behind falling out of focus. 85mm f/1.8, shot from a low angle. Warm sand and deep charcoal grade, no saturated colour.`,

  "prompt-escuro": `Close-up of a pair of hands poised over a slim modern keyboard in a dark room at night, caught in the instant before typing, centred in the frame. The only light is a cold glow spilling from a screen just out of frame, catching the knuckles and the edges of the keys. 50mm f/1.8, sharp on the hands with the keys falling into soft bokeh so no character is legible. Teal-tinted light against near-total black.`,
};

/** O prompt completo, já com o bloco técnico que o template pedir. */
export function promptDe(id) {
  const base = PROMPTS[id];
  if (!base) return null;
  return `${base}\n${COM_TEXTO.has(id) ? BLOCO_TECNICO_COM_TEXTO : BLOCO_TECNICO}`;
}
