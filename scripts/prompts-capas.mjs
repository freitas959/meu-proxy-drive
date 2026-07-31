// Texto exato enviado ao Gemini para cada capa de template.
//
// Este arquivo é a fonte da verdade; `docs/capas-dos-templates.md` é a versão
// para ler, com a explicação em português de cada escolha. Se mudar aqui,
// mude lá — e vice-versa.

/**
 * Vai colado no fim de todo prompt.
 *
 * O "metade de cima" não é preciosismo: o título é desenhado a partir de uns
 * 65% da altura do card. Pedir o assunto no terço superior deixava uma faixa
 * inteira de sobreposição, e foi ali que o prato, o rosto e a máquina de
 * escrever foram parar — cobertos pelo texto.
 */
export const BLOCO_TECNICO = `
Vertical 4:5 composition. Photorealistic editorial photograph, full-frame
camera, natural film grain.

CRITICAL FRAMING: the main subject must sit entirely within the TOP HALF of
the frame. The bottom 45% of the image must be empty — plain background,
shadow, floor or out-of-focus surface — with no subject, no face, no product
and no important detail, because large text will be placed over it. Compose
with generous empty space below the subject.

No text, letters, numbers, logos or watermarks anywhere in the image. No real
or recognizable public figures.`;

export const PROMPTS = {
  insider: `A woman in her thirties sitting alone in a bare concrete studio, leaning back in a wooden chair, eyes closed, exhausted but composed. Loose sheets of paper suspended in mid-air around her, frozen in motion, concentrated in the upper half of the frame. Hard directional light from a single tall window on camera left, deep black shadows on the right. 35mm lens, slight motion blur on the papers. Desaturated grey and black grade.`,

  "inteligencia-artificial": `A dark workshop bench with a partially disassembled machine, amber work light raking across brushed metal, fine dust suspended in the beam. 100mm macro, extreme shallow focus on one component, everything else swallowed by black.`,

  advocacia: `A man in his fifties wearing a dark tailored suit, standing in a classic law library, one hand resting on a bookshelf, looking off camera with quiet authority. Warm tungsten lamp glow behind him creating a rim light along his shoulder. 85mm f/1.8, shallow depth of field, bookshelves dissolving into bokeh. Deep amber and near-black grade.`,

  "noticias-virais": `A young woman standing still in a crowded avenue at night while everyone around her moves in motion blur, looking past the camera. Neon signage reflecting on wet asphalt. 35mm, 1/15s shutter, handheld documentary feel. Yellow and amber neon against deep black.`,

  "academia-fitness": `An athlete resting between sets in a dark gym, forearms on knees, head down, breathing hard, sweat on the shoulders. Single hard lime-green light from high behind, chalk dust suspended in the beam. 50mm, low camera angle. Black background, green rim light as the only colour.`,

  "clinica-estetica": `A woman's face in three-quarter view, eyes lowered, luminous untouched skin, framed high in the upper half of the image with her shoulders barely entering the frame. Deep neutral backdrop. Single large softbox on camera right with gentle falloff. 85mm f/2, shallow focus on the cheekbone. Warm champagne and dark chocolate grade; the lower half of the frame is empty backdrop falling into shadow.`,

  nutricionista: `A nutritionist in a bright kitchen laughing mid-gesture while plating a colourful bowl, fresh herbs and vegetables scattered on the counter. Soft daylight from a large window behind her. 35mm, natural colour, greens dominant. Foreground counter falling into shadow.`,

  imobiliaria: `A couple seen from behind standing in an empty high-end apartment at dusk, looking out floor-to-ceiling windows at the city skyline. Warm golden light flooding in, long shadows across the bare floor. 24mm wide, architectural framing. Amber and deep brown grade.`,

  marketing: `A young person in profile in a dark room, face lit only by shifting purple and blue light, focused expression. Out-of-focus point lights behind. 85mm f/1.4, heavy bokeh. Violet and magenta grade over near-black.`,

  noticias: `A person standing on a night street checking a phone, face lit from below by the screen glow, blurred traffic light streaks behind. 50mm, shallow depth of field, urgent documentary feel. Cold blue background with a single red light source.`,

  dentistas: `A dentist in scrubs standing in a modern clinic, arms crossed, warm confident smile, blurred equipment behind. Clean even lighting. 50mm f/2. Cyan and white palette, background falling off to deep teal at the bottom of the frame.`,

  "medicos-hospitalar": `A doctor walking down a modern hospital corridor toward the camera, mid-stride, slightly soft focus. Cool blue light from ceiling panels, strong perspective lines. 50mm, shallow depth of field. Blue and steel grade, foreground floor in shadow.`,

  "beleza-estetica": `A woman having her hair worked on in an upscale salon, seen through a mirror reflection, calm expression, warm lamps glowing behind her. 50mm f/1.8, shallow depth of field. Dusty rose and deep wine grade.`,

  "educacao-professores": `A teacher mid-explanation in front of a class, gesturing with one hand, genuinely animated. Students in the foreground rendered as dark out-of-focus silhouettes. Warm morning light from side windows. 35mm. Chalk yellow highlights against a dark board.`,

  hamburgueria: `A handmade burger shot from a high three-quarter angle, sitting in the upper portion of the frame on a dark wooden board. Melted cheese spilling, steam rising, sesame bun glistening under a hard warm light from camera left. 100mm macro, very shallow depth of field. Ember orange and burnt brown grade; the board and table run empty and dark toward the bottom of the frame.`,

  pizzaria: `A pizzaiolo pulling a pizza out of a wood-fired oven on a long metal peel, flames visible inside the oven mouth, flour dust and sparks suspended in the air, face lit from below by the fire. 35mm, slight motion blur on the peel. Amber and deep black grade, everything below the oven in shadow.`,

  restaurante: `A beautifully plated dish shot from a high three-quarter angle, positioned in the upper portion of the frame, on a dark restaurant table at night. A single warm pendant lamp above pours light straight onto the food, making it the brightest thing in the picture — glistening sauce, visible texture, steam. Cutlery and a wine glass out of focus at the edges. 50mm f/2. Copper and near-black grade; the table surface in front of the dish runs empty and dark toward the bottom of the frame.`,

  "contabilidade-financeiro": `Close-up of an old mechanical calculator on a dark wooden desk, raking golden morning light from the left carving long shadows across the keys. 100mm macro, shallow focus on the key row. Deep green and gold grade, background dissolving into black.`,

  turismo: `A traveller standing on a coastal viewpoint at sunset, seen from behind, wind in their clothes, mountains meeting the sea ahead. Backlit by the low sun, soft lens flare. 35mm. Orange and teal grade, foreground rocks in deep shadow.`,

  pets: `A golden retriever sitting and looking up attentively at a hand just outside the frame, in a warm living room, late afternoon light through a window. 50mm f/1.8, shallow depth of field, camera at the dog's eye level. Caramel and amber grade, floor in shadow.`,

  "joias-semijoias": `A single fine gold chain draped over dark satin, one hard pin light raking across the metal creating a controlled specular highlight. 100mm macro, extreme shallow depth of field. Everything beyond the chain in complete black.`,

  "prompt-claro": `An old mechanical typewriter on a cream-coloured table, three-quarter view, placed high in the upper half of the frame, one completely blank sheet of paper curling out of the roller. Soft overhead studio light, clean minimal set. 50mm. Warm cream and black palette; the empty table surface fills the lower half and darkens toward the bottom edge.`,

  "prompt-escuro": `A single desk lamp switched on in a pitch-dark room, the lamp itself high in the upper half of the frame, its cone of cold light falling onto an empty desk. Everything else in near-total darkness. 35mm. Teal-tinted white light, black background; the lower half of the frame is empty desk surface fading to black.`,
};

/** O prompt completo, já com o bloco técnico. */
export function promptDe(id) {
  const base = PROMPTS[id];
  return base ? `${base}\n${BLOCO_TECNICO}` : null;
}
