const connection = require("../db");

exports.createExamenMedical = async (data) => {
    return new Promise((resolve, reject) => {
        const sql = `
        INSERT INTO Examen_Medical (
          utilisateur_id, poids, taille, IMC, tension, vision_d, vision_g,
          larmoiement, douleurs, taches_yeux, audition_d, audition_g, sifflements,
          angines, epistaxis, rhinorrhee, cephalies, vertiges, troubles_sommeil,
          peau_normal, peau_anormale, douleurs_musculaires, douleurs_articulaires,
          douleurs_neurologiques, toux, dyspnee, douleurs_thoraciques, palpitations,
          oedemes, cyanose, pyrosis, vomissements, douleurs_abdominales, dysurie,
          hematurie, cycles_irreguliers, fonction_respiratoire, fonction_circulatoire,
          fonction_motrice, sanguins, urinaires, radiologiques, hepatites_pos,
          hepatites_neg, syphilis_pos, syphilis_neg, vih_pos, vih_neg
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?
        )
      `;
      
  
      const values = [
        data.utilisateur_id,
        data.poids,
        data.taille,
        data.IMC,
        data.tension,
        data.vision_d,
        data.vision_g,
        data.larmoiement,
        data.douleurs,
        data.taches_yeux,
        data.audition_d,
        data.audition_g,
        data.sifflements,
        data.angines,
        data.epistaxis,
        data.rhinorrhee,
        data.cephalies,
        data.vertiges,
        data.troubles_sommeil,
        data.peau_normal,
        data.peau_anormale,
        data.douleurs_musculaires,
        data.douleurs_articulaires,
        data.douleurs_neurologiques,
        data.toux,
        data.dyspnee,
        data.douleurs_thoraciques,
        data.palpitations,
        data.oedemes,
        data.cyanose,
        data.pyrosis,
        data.vomissements,
        data.douleurs_abdominales,
        data.dysurie,
        data.hematurie,
        data.cycles_irreguliers,
        data.fonction_respiratoire,
        data.fonction_circulatoire,
        data.fonction_motrice,
        data.sanguins,
        data.urinaires,
        data.radiologiques,
        data.hepatites_pos,
        data.hepatites_neg,
        data.syphilis_pos,
        data.syphilis_neg,
        data.vih_pos,
        data.vih_neg
      ];
      
  
      connection.query(sql, values, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve({ message: "Examen Medical created", id: result.insertId });
        }
      });
    });
  };
  
