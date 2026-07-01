export const GLOBAL_STATUS_OPTIONS = Object.freeze([
  "Sorunsuz",
  "Kontrol Gerekli",
  "Kusurlu",
  "İşlemli",
  "Uygulanamaz"
]);

export const OTOTR_EXPERTISE_TEST_MODULES = Object.freeze([
  {
    "moduleNo": 1,
    "moduleId": "motor",
    "key": "motor",
    "title": "MOTOR EKSPERTİZ VE CHECK-UP",
    "shortTitle": "Motor",
    "groupTitle": "MOTOR EKSPERTİZ VE CHECK-UP",
    "groupTitles": [
      "MOTOR EKSPERTİZ VE CHECK-UP"
    ],
    "itemCount": 37,
    "items": [
      {
        "order": 1,
        "itemNo": 1,
        "noktaId": "64",
        "itemId": "n64-motor-koruyucu-kapagi-hava-filtre-ve-borulari",
        "title": "Motor Koruyucu Kapağı/Hava Filtre ve Boruları",
        "moduleId": "motor",
        "moduleTitle": "MOTOR EKSPERTİZ VE CHECK-UP",
        "statusOptions": [
          "İyi",
          "Kırık",
          "Motor Koruyucu Kapağı Yok",
          "Deforme"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "İyi",
            "label": "İyi",
            "displayLabel": "İyi",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "İyi"
          },
          {
            "optionType": "label",
            "value": "Kırık",
            "label": "Kırık",
            "displayLabel": "Kırık",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Kırık"
          },
          {
            "optionType": "label",
            "value": "Motor Koruyucu Kapağı Yok",
            "label": "Motor Koruyucu Kapağı Yok",
            "displayLabel": "Motor Koruyucu Kapağı Yok",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Motor Koruyucu Kapağı Yok"
          },
          {
            "optionType": "label",
            "value": "Deforme",
            "label": "Deforme",
            "displayLabel": "Deforme",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Deforme"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 4,
        "labeledOptionCount": 4,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 3
        }
      },
      {
        "order": 2,
        "itemNo": 2,
        "noktaId": "70",
        "itemId": "n70-motor-isi-ve-ses-izolasyonu",
        "title": "Motor Isı ve Ses İzolasyonu",
        "moduleId": "motor",
        "moduleTitle": "MOTOR EKSPERTİZ VE CHECK-UP",
        "statusOptions": [
          "İyi",
          "Orta",
          "Kötü",
          "Yok"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "İyi",
            "label": "İyi",
            "displayLabel": "İyi",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "İyi"
          },
          {
            "optionType": "label",
            "value": "Orta",
            "label": "Orta",
            "displayLabel": "Orta",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Orta"
          },
          {
            "optionType": "label",
            "value": "Kötü",
            "label": "Kötü",
            "displayLabel": "Kötü",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Kötü"
          },
          {
            "optionType": "label",
            "value": "Yok",
            "label": "Yok",
            "displayLabel": "Yok",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Yok"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 4,
        "labeledOptionCount": 4,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 2
        }
      },
      {
        "order": 3,
        "itemNo": 3,
        "noktaId": "82",
        "itemId": "n82-fren-ana-merkez-hidrolik-sizdirmazligi",
        "title": "Fren Ana Merkez Hidrolik Sızdırmazlığı",
        "moduleId": "motor",
        "moduleTitle": "MOTOR EKSPERTİZ VE CHECK-UP",
        "statusOptions": [],
        "options": [
          {
            "optionType": "checkbox",
            "value": "117",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=117"
          },
          {
            "optionType": "checkbox",
            "value": "155",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=155"
          },
          {
            "optionType": "checkbox",
            "value": "1139",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1139"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 3,
        "labeledOptionCount": 0,
        "placeholderOptionCount": 3,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": true,
          "criticalOptionCountHeuristic": 0
        }
      },
      {
        "order": 4,
        "itemNo": 4,
        "noktaId": "81",
        "itemId": "n81-antifiriz",
        "title": "Antifiriz",
        "moduleId": "motor",
        "moduleTitle": "MOTOR EKSPERTİZ VE CHECK-UP",
        "statusOptions": [
          "İyi",
          "Orta",
          "Yok",
          "Paslanma Mevcut"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "İyi",
            "label": "İyi",
            "displayLabel": "İyi",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "İyi"
          },
          {
            "optionType": "label",
            "value": "Orta",
            "label": "Orta",
            "displayLabel": "Orta",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Orta"
          },
          {
            "optionType": "label",
            "value": "Yok",
            "label": "Yok",
            "displayLabel": "Yok",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Yok"
          },
          {
            "optionType": "label",
            "value": "Paslanma Mevcut",
            "label": "Paslanma Mevcut",
            "displayLabel": "Paslanma Mevcut",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Paslanma Mevcut"
          }
        ],
        "inputs": [
          {
            "inputType": "text",
            "label": "Antifriz",
            "name": "EkAlan",
            "sourceText": "text (Antifriz) name=EkAlan"
          }
        ],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 4,
        "labeledOptionCount": 4,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 1
        }
      },
      {
        "order": 5,
        "itemNo": 5,
        "noktaId": "80",
        "itemId": "n80-aku",
        "title": "Akü(%)",
        "moduleId": "motor",
        "moduleTitle": "MOTOR EKSPERTİZ VE CHECK-UP",
        "statusOptions": [],
        "options": [
          {
            "optionType": "checkbox",
            "value": "115",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=115"
          },
          {
            "optionType": "checkbox",
            "value": "134",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=134"
          },
          {
            "optionType": "checkbox",
            "value": "153",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=153"
          },
          {
            "optionType": "checkbox",
            "value": "8652",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=8652"
          }
        ],
        "inputs": [
          {
            "inputType": "number",
            "label": "Numeric bir değer girin",
            "name": "EkAlan",
            "sourceText": "number (Numeric bir değer girin) name=EkAlan"
          }
        ],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 4,
        "labeledOptionCount": 0,
        "placeholderOptionCount": 4,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": true,
          "criticalOptionCountHeuristic": 0
        }
      },
      {
        "order": 6,
        "itemNo": 6,
        "noktaId": "79",
        "itemId": "n79-v-kayisi-gergi-rulmani-ses-durumu",
        "title": "V Kayışı Gergi Rulmanı Ses Durumu",
        "moduleId": "motor",
        "moduleTitle": "MOTOR EKSPERTİZ VE CHECK-UP",
        "statusOptions": [],
        "options": [
          {
            "optionType": "checkbox",
            "value": "114",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=114"
          },
          {
            "optionType": "checkbox",
            "value": "133",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=133"
          },
          {
            "optionType": "checkbox",
            "value": "152",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=152"
          },
          {
            "optionType": "checkbox",
            "value": "3042",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=3042"
          },
          {
            "optionType": "checkbox",
            "value": "8610",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=8610"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 5,
        "labeledOptionCount": 0,
        "placeholderOptionCount": 5,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": true,
          "criticalOptionCountHeuristic": 0
        }
      },
      {
        "order": 7,
        "itemNo": 7,
        "noktaId": "244",
        "itemId": "n244-triger-kayisi-zinciri-ses-durumu",
        "title": "Triger Kayışı-Zinciri Ses Durumu",
        "moduleId": "motor",
        "moduleTitle": "MOTOR EKSPERTİZ VE CHECK-UP",
        "statusOptions": [],
        "options": [
          {
            "optionType": "checkbox",
            "value": "1133",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1133"
          },
          {
            "optionType": "checkbox",
            "value": "1134",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1134"
          },
          {
            "optionType": "checkbox",
            "value": "1135",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1135"
          },
          {
            "optionType": "checkbox",
            "value": "2039",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=2039"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 4,
        "labeledOptionCount": 0,
        "placeholderOptionCount": 4,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": true,
          "criticalOptionCountHeuristic": 0
        }
      },
      {
        "order": 8,
        "itemNo": 8,
        "noktaId": "77",
        "itemId": "n77-direksiyon-pompasi-ve-borulari-yag-kacagi-durumu",
        "title": "Direksiyon Pompası ve Boruları Yağ Kaçağı Durumu",
        "moduleId": "motor",
        "moduleTitle": "MOTOR EKSPERTİZ VE CHECK-UP",
        "statusOptions": [],
        "options": [
          {
            "optionType": "checkbox",
            "value": "112",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=112"
          },
          {
            "optionType": "checkbox",
            "value": "131",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=131"
          },
          {
            "optionType": "checkbox",
            "value": "150",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=150"
          },
          {
            "optionType": "checkbox",
            "value": "4297",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=4297"
          },
          {
            "optionType": "checkbox",
            "value": "8629",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=8629"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 5,
        "labeledOptionCount": 0,
        "placeholderOptionCount": 5,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": true,
          "criticalOptionCountHeuristic": 0
        }
      },
      {
        "order": 9,
        "itemNo": 9,
        "noktaId": "310",
        "itemId": "n310-fren-hidroligi-durumu",
        "title": "Fren Hidroliği Durumu",
        "moduleId": "motor",
        "moduleTitle": "MOTOR EKSPERTİZ VE CHECK-UP",
        "statusOptions": [
          "İyi",
          "Kötü"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "İyi",
            "label": "İyi",
            "displayLabel": "İyi",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "İyi"
          },
          {
            "optionType": "label",
            "value": "Kötü",
            "label": "Kötü",
            "displayLabel": "Kötü",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Kötü"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 2,
        "labeledOptionCount": 2,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 1
        }
      },
      {
        "order": 10,
        "itemNo": 10,
        "noktaId": "76",
        "itemId": "n76-motor-yag-seviyesi",
        "title": "Motor Yağ Seviyesi",
        "moduleId": "motor",
        "moduleTitle": "MOTOR EKSPERTİZ VE CHECK-UP",
        "statusOptions": [],
        "options": [
          {
            "optionType": "checkbox",
            "value": "111",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=111"
          },
          {
            "optionType": "checkbox",
            "value": "130",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=130"
          },
          {
            "optionType": "checkbox",
            "value": "149",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=149"
          },
          {
            "optionType": "checkbox",
            "value": "1132",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1132"
          },
          {
            "optionType": "checkbox",
            "value": "8625",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=8625"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 5,
        "labeledOptionCount": 0,
        "placeholderOptionCount": 5,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": true,
          "criticalOptionCountHeuristic": 0
        }
      },
      {
        "order": 11,
        "itemNo": 11,
        "noktaId": "67",
        "itemId": "n67-motor-ust-bolge-yag-sizdirmazligi",
        "title": "Motor Üst Bölge Yağ Sızdırmazlığı",
        "moduleId": "motor",
        "moduleTitle": "MOTOR EKSPERTİZ VE CHECK-UP",
        "statusOptions": [],
        "options": [
          {
            "optionType": "checkbox",
            "value": "102",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=102"
          },
          {
            "optionType": "checkbox",
            "value": "121",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=121"
          },
          {
            "optionType": "checkbox",
            "value": "140",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=140"
          },
          {
            "optionType": "checkbox",
            "value": "1122",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1122"
          },
          {
            "optionType": "checkbox",
            "value": "1123",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1123"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 5,
        "labeledOptionCount": 0,
        "placeholderOptionCount": 5,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": true,
          "criticalOptionCountHeuristic": 0
        }
      },
      {
        "order": 12,
        "itemNo": 12,
        "noktaId": "75",
        "itemId": "n75-yakit-sistemi-ve-sizdirmazlik",
        "title": "Yakıt Sistemi ve Sızdırmazlık",
        "moduleId": "motor",
        "moduleTitle": "MOTOR EKSPERTİZ VE CHECK-UP",
        "statusOptions": [
          "İyi",
          "Orta",
          "Kötü"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "İyi",
            "label": "İyi",
            "displayLabel": "İyi",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "İyi"
          },
          {
            "optionType": "label",
            "value": "Orta",
            "label": "Orta",
            "displayLabel": "Orta",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Orta"
          },
          {
            "optionType": "label",
            "value": "Kötü",
            "label": "Kötü",
            "displayLabel": "Kötü",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Kötü"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 3,
        "labeledOptionCount": 3,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 1
        }
      },
      {
        "order": 13,
        "itemNo": 13,
        "noktaId": "74",
        "itemId": "n74-sol-kule-bilyalari",
        "title": "Sol Kule Bilyaları",
        "moduleId": "motor",
        "moduleTitle": "MOTOR EKSPERTİZ VE CHECK-UP",
        "statusOptions": [
          "İyi",
          "Orta",
          "Kötü"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "İyi",
            "label": "İyi",
            "displayLabel": "İyi",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "İyi"
          },
          {
            "optionType": "label",
            "value": "Orta",
            "label": "Orta",
            "displayLabel": "Orta",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Orta"
          },
          {
            "optionType": "label",
            "value": "Kötü",
            "label": "Kötü",
            "displayLabel": "Kötü",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Kötü"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 3,
        "labeledOptionCount": 3,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 1
        }
      },
      {
        "order": 14,
        "itemNo": 14,
        "noktaId": "71",
        "itemId": "n71-sag-kule-bilyalari",
        "title": "Sağ Kule Bilyaları",
        "moduleId": "motor",
        "moduleTitle": "MOTOR EKSPERTİZ VE CHECK-UP",
        "statusOptions": [
          "İyi",
          "Orta",
          "Kötü"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "İyi",
            "label": "İyi",
            "displayLabel": "İyi",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "İyi"
          },
          {
            "optionType": "label",
            "value": "Orta",
            "label": "Orta",
            "displayLabel": "Orta",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Orta"
          },
          {
            "optionType": "label",
            "value": "Kötü",
            "label": "Kötü",
            "displayLabel": "Kötü",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Kötü"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 3,
        "labeledOptionCount": 3,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 1
        }
      },
      {
        "order": 15,
        "itemNo": 15,
        "noktaId": "72",
        "itemId": "n72-radyator-genel-durumu",
        "title": "Radyatör Genel Durumu",
        "moduleId": "motor",
        "moduleTitle": "MOTOR EKSPERTİZ VE CHECK-UP",
        "statusOptions": [],
        "options": [
          {
            "optionType": "checkbox",
            "value": "107",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=107"
          },
          {
            "optionType": "checkbox",
            "value": "126",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=126"
          },
          {
            "optionType": "checkbox",
            "value": "145",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=145"
          },
          {
            "optionType": "checkbox",
            "value": "1125",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1125"
          },
          {
            "optionType": "checkbox",
            "value": "1126",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1126"
          },
          {
            "optionType": "checkbox",
            "value": "7285",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=7285"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 6,
        "labeledOptionCount": 0,
        "placeholderOptionCount": 6,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": true,
          "criticalOptionCountHeuristic": 0
        }
      },
      {
        "order": 16,
        "itemNo": 16,
        "noktaId": "243",
        "itemId": "n243-intercooler-genel-durumu",
        "title": "Intercooler Genel Durumu",
        "moduleId": "motor",
        "moduleTitle": "MOTOR EKSPERTİZ VE CHECK-UP",
        "statusOptions": [],
        "options": [
          {
            "optionType": "checkbox",
            "value": "1127",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1127"
          },
          {
            "optionType": "checkbox",
            "value": "1128",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1128"
          },
          {
            "optionType": "checkbox",
            "value": "1129",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1129"
          },
          {
            "optionType": "checkbox",
            "value": "1452",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1452"
          },
          {
            "optionType": "checkbox",
            "value": "3132",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=3132"
          },
          {
            "optionType": "checkbox",
            "value": "7284",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=7284"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 6,
        "labeledOptionCount": 0,
        "placeholderOptionCount": 6,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": true,
          "criticalOptionCountHeuristic": 0
        }
      },
      {
        "order": 17,
        "itemNo": 17,
        "noktaId": "73",
        "itemId": "n73-sogutma-fanlari",
        "title": "Soğutma Fanları",
        "moduleId": "motor",
        "moduleTitle": "MOTOR EKSPERTİZ VE CHECK-UP",
        "statusOptions": [],
        "options": [
          {
            "optionType": "checkbox",
            "value": "108",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=108"
          },
          {
            "optionType": "checkbox",
            "value": "146",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=146"
          },
          {
            "optionType": "checkbox",
            "value": "1130",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1130"
          },
          {
            "optionType": "checkbox",
            "value": "1131",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1131"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 4,
        "labeledOptionCount": 0,
        "placeholderOptionCount": 4,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": true,
          "criticalOptionCountHeuristic": 0
        }
      },
      {
        "order": 18,
        "itemNo": 18,
        "noktaId": "66",
        "itemId": "n66-sogutma-suyu-hortumlari-ve-sizdirmalik",
        "title": "Soğutma Suyu Hortumları ve Sızdırmalık",
        "moduleId": "motor",
        "moduleTitle": "MOTOR EKSPERTİZ VE CHECK-UP",
        "statusOptions": [],
        "options": [
          {
            "optionType": "checkbox",
            "value": "101",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=101"
          },
          {
            "optionType": "checkbox",
            "value": "120",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=120"
          },
          {
            "optionType": "checkbox",
            "value": "139",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=139"
          },
          {
            "optionType": "checkbox",
            "value": "1487",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1487"
          },
          {
            "optionType": "checkbox",
            "value": "5550",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=5550"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 5,
        "labeledOptionCount": 0,
        "placeholderOptionCount": 5,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": true,
          "criticalOptionCountHeuristic": 0
        }
      },
      {
        "order": 19,
        "itemNo": 19,
        "noktaId": "242",
        "itemId": "n242-klima-kompresoru-genel-durumu",
        "title": "Klima Kompresörü Genel Durumu",
        "moduleId": "motor",
        "moduleTitle": "MOTOR EKSPERTİZ VE CHECK-UP",
        "statusOptions": [
          "İyi",
          "Orta",
          "Kötü",
          "Yok"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "İyi",
            "label": "İyi",
            "displayLabel": "İyi",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "İyi"
          },
          {
            "optionType": "label",
            "value": "Orta",
            "label": "Orta",
            "displayLabel": "Orta",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Orta"
          },
          {
            "optionType": "label",
            "value": "Kötü",
            "label": "Kötü",
            "displayLabel": "Kötü",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Kötü"
          },
          {
            "optionType": "label",
            "value": "Yok",
            "label": "Yok",
            "displayLabel": "Yok",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Yok"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 4,
        "labeledOptionCount": 4,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 2
        }
      },
      {
        "order": 20,
        "itemNo": 20,
        "noktaId": "68",
        "itemId": "n68-klima-borulari",
        "title": "Klima Boruları",
        "moduleId": "motor",
        "moduleTitle": "MOTOR EKSPERTİZ VE CHECK-UP",
        "statusOptions": [
          "İyi",
          "İşlemli-Deformasyon Mevcut",
          "Acil Servis Bakımı Gerekli",
          "Yok"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "İyi",
            "label": "İyi",
            "displayLabel": "İyi",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "İyi"
          },
          {
            "optionType": "label",
            "value": "İşlemli-Deformasyon Mevcut",
            "label": "İşlemli-Deformasyon Mevcut",
            "displayLabel": "İşlemli-Deformasyon Mevcut",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "İşlemli-Deformasyon Mevcut"
          },
          {
            "optionType": "label",
            "value": "Acil Servis Bakımı Gerekli",
            "label": "Acil Servis Bakımı Gerekli",
            "displayLabel": "Acil Servis Bakımı Gerekli",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Acil Servis Bakımı Gerekli"
          },
          {
            "optionType": "label",
            "value": "Yok",
            "label": "Yok",
            "displayLabel": "Yok",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Yok"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 4,
        "labeledOptionCount": 4,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 3
        }
      },
      {
        "order": 21,
        "itemNo": 21,
        "noktaId": "69",
        "itemId": "n69-turbo-yag-sizdirmazligi-ust-bolge",
        "title": "Turbo Yağ Sızdırmazlığı-Üst Bölge",
        "moduleId": "motor",
        "moduleTitle": "MOTOR EKSPERTİZ VE CHECK-UP",
        "statusOptions": [],
        "options": [
          {
            "optionType": "checkbox",
            "value": "104",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=104"
          },
          {
            "optionType": "checkbox",
            "value": "123",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=123"
          },
          {
            "optionType": "checkbox",
            "value": "142",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=142"
          },
          {
            "optionType": "checkbox",
            "value": "1120",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1120"
          },
          {
            "optionType": "checkbox",
            "value": "1121",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1121"
          },
          {
            "optionType": "checkbox",
            "value": "1124",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1124"
          },
          {
            "optionType": "checkbox",
            "value": "1451",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1451"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 7,
        "labeledOptionCount": 0,
        "placeholderOptionCount": 7,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": true,
          "criticalOptionCountHeuristic": 0
        }
      },
      {
        "order": 22,
        "itemNo": 22,
        "noktaId": "241",
        "itemId": "n241-turbo-borulari-genel-durumu",
        "title": "Turbo Boruları Genel Durumu",
        "moduleId": "motor",
        "moduleTitle": "MOTOR EKSPERTİZ VE CHECK-UP",
        "statusOptions": [
          "İyi",
          "Orta",
          "Kötü",
          "Yok",
          "Yağ Kaçağı Mevcut",
          "Terleme Mevcut"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "İyi",
            "label": "İyi",
            "displayLabel": "İyi",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "İyi"
          },
          {
            "optionType": "label",
            "value": "Orta",
            "label": "Orta",
            "displayLabel": "Orta",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Orta"
          },
          {
            "optionType": "label",
            "value": "Kötü",
            "label": "Kötü",
            "displayLabel": "Kötü",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Kötü"
          },
          {
            "optionType": "label",
            "value": "Yok",
            "label": "Yok",
            "displayLabel": "Yok",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Yok"
          },
          {
            "optionType": "label",
            "value": "Yağ Kaçağı Mevcut",
            "label": "Yağ Kaçağı Mevcut",
            "displayLabel": "Yağ Kaçağı Mevcut",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Yağ Kaçağı Mevcut"
          },
          {
            "optionType": "label",
            "value": "Terleme Mevcut",
            "label": "Terleme Mevcut",
            "displayLabel": "Terleme Mevcut",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Terleme Mevcut"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 6,
        "labeledOptionCount": 6,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 3
        }
      },
      {
        "order": 23,
        "itemNo": 23,
        "noktaId": "65",
        "itemId": "n65-motor-elektrik-tesisati-ve-kablolari",
        "title": "Motor Elektrik Tesisatı ve Kabloları",
        "moduleId": "motor",
        "moduleTitle": "MOTOR EKSPERTİZ VE CHECK-UP",
        "statusOptions": [],
        "options": [
          {
            "optionType": "checkbox",
            "value": "100",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=100"
          },
          {
            "optionType": "checkbox",
            "value": "3031",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=3031"
          },
          {
            "optionType": "checkbox",
            "value": "138",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=138"
          },
          {
            "optionType": "checkbox",
            "value": "119",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=119"
          },
          {
            "optionType": "checkbox",
            "value": "1118",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1118"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 5,
        "labeledOptionCount": 0,
        "placeholderOptionCount": 5,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": true,
          "criticalOptionCountHeuristic": 0
        }
      },
      {
        "order": 24,
        "itemNo": 24,
        "noktaId": "171",
        "itemId": "n171-motor-piston-kompresor-testi-gerekli-mi",
        "title": "Motor Piston Kompresör testi gerekli mi?",
        "moduleId": "motor",
        "moduleTitle": "MOTOR EKSPERTİZ VE CHECK-UP",
        "statusOptions": [
          "EVET",
          "Hayır",
          "Motorda Tekleme Var"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "EVET",
            "label": "EVET",
            "displayLabel": "EVET",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "EVET"
          },
          {
            "optionType": "label",
            "value": "Hayır",
            "label": "Hayır",
            "displayLabel": "Hayır",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Hayır"
          },
          {
            "optionType": "label",
            "value": "Motorda Tekleme Var",
            "label": "Motorda Tekleme Var",
            "displayLabel": "Motorda Tekleme Var",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Motorda Tekleme Var"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 3,
        "labeledOptionCount": 3,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 2
        }
      },
      {
        "order": 25,
        "itemNo": 25,
        "noktaId": "249",
        "itemId": "n249-egzoz-bolgesinde-siyah-duman-var-mi",
        "title": "Egzoz Bölgesinde Siyah Duman Var mı?",
        "moduleId": "motor",
        "moduleTitle": "MOTOR EKSPERTİZ VE CHECK-UP",
        "statusOptions": [],
        "options": [
          {
            "optionType": "checkbox",
            "value": "1147",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1147"
          },
          {
            "optionType": "checkbox",
            "value": "1146",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1146"
          },
          {
            "optionType": "checkbox",
            "value": "1148",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1148"
          },
          {
            "optionType": "checkbox",
            "value": "8645",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=8645"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 4,
        "labeledOptionCount": 0,
        "placeholderOptionCount": 4,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": true,
          "criticalOptionCountHeuristic": 0
        }
      },
      {
        "order": 26,
        "itemNo": 26,
        "noktaId": "248",
        "itemId": "n248-egzoz-bolgesinde-yag-dumani-mevcut-mu",
        "title": "Egzoz Bölgesinde Yağ Dumanı Mevcut mu?",
        "moduleId": "motor",
        "moduleTitle": "MOTOR EKSPERTİZ VE CHECK-UP",
        "statusOptions": [
          "Evet",
          "Hayır"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "Evet",
            "label": "Evet",
            "displayLabel": "Evet",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Evet"
          },
          {
            "optionType": "label",
            "value": "Hayır",
            "label": "Hayır",
            "displayLabel": "Hayır",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Hayır"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 2,
        "labeledOptionCount": 2,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 1
        }
      },
      {
        "order": 27,
        "itemNo": 27,
        "noktaId": "250",
        "itemId": "n250-egzoz-manifoltunda-gaz-kacagi-var-mi",
        "title": "Egzoz Manifoltunda Gaz Kaçağı Var mı?",
        "moduleId": "motor",
        "moduleTitle": "MOTOR EKSPERTİZ VE CHECK-UP",
        "statusOptions": [
          "Evet",
          "Hayır"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "Evet",
            "label": "Evet",
            "displayLabel": "Evet",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Evet"
          },
          {
            "optionType": "label",
            "value": "Hayır",
            "label": "Hayır",
            "displayLabel": "Hayır",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Hayır"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 2,
        "labeledOptionCount": 2,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 1
        }
      },
      {
        "order": 28,
        "itemNo": 28,
        "noktaId": "252",
        "itemId": "n252-motor-suyunda-yag-var-mi",
        "title": "Motor Suyunda Yağ Var mı?",
        "moduleId": "motor",
        "moduleTitle": "MOTOR EKSPERTİZ VE CHECK-UP",
        "statusOptions": [],
        "options": [
          {
            "optionType": "checkbox",
            "value": "1156",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1156"
          },
          {
            "optionType": "checkbox",
            "value": "1399",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1399"
          },
          {
            "optionType": "checkbox",
            "value": "1400",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1400"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 3,
        "labeledOptionCount": 0,
        "placeholderOptionCount": 3,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": true,
          "criticalOptionCountHeuristic": 0
        }
      },
      {
        "order": 29,
        "itemNo": 29,
        "noktaId": "251",
        "itemId": "n251-motor-yaginda-sogutma-suyu-var-mi",
        "title": "Motor Yağında Soğutma Suyu Var mı?",
        "moduleId": "motor",
        "moduleTitle": "MOTOR EKSPERTİZ VE CHECK-UP",
        "statusOptions": [],
        "options": [
          {
            "optionType": "checkbox",
            "value": "1152",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1152"
          },
          {
            "optionType": "checkbox",
            "value": "1151",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1151"
          },
          {
            "optionType": "checkbox",
            "value": "1153",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1153"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 3,
        "labeledOptionCount": 0,
        "placeholderOptionCount": 3,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": true,
          "criticalOptionCountHeuristic": 0
        }
      },
      {
        "order": 30,
        "itemNo": 30,
        "noktaId": "246",
        "itemId": "n246-motorda-ufleme-mevcut-mu",
        "title": "Motorda Üfleme Mevcut mu?",
        "moduleId": "motor",
        "moduleTitle": "MOTOR EKSPERTİZ VE CHECK-UP",
        "statusOptions": [
          "Evet",
          "Hayır"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "Evet",
            "label": "Evet",
            "displayLabel": "Evet",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Evet"
          },
          {
            "optionType": "label",
            "value": "Hayır",
            "label": "Hayır",
            "displayLabel": "Hayır",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Hayır"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 2,
        "labeledOptionCount": 2,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 1
        }
      },
      {
        "order": 31,
        "itemNo": 31,
        "noktaId": "247",
        "itemId": "n247-motorda-vuruntulu-calisma-mevcut-mu",
        "title": "Motorda Vuruntulu Çalışma Mevcut mu?",
        "moduleId": "motor",
        "moduleTitle": "MOTOR EKSPERTİZ VE CHECK-UP",
        "statusOptions": [
          "Evet",
          "Hayır"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "Evet",
            "label": "Evet",
            "displayLabel": "Evet",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Evet"
          },
          {
            "optionType": "label",
            "value": "Hayır",
            "label": "Hayır",
            "displayLabel": "Hayır",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Hayır"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 2,
        "labeledOptionCount": 2,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 1
        }
      },
      {
        "order": 32,
        "itemNo": 32,
        "noktaId": "245",
        "itemId": "n245-sarj-ve-mars-dinamosu-rulmani-ses-durumu",
        "title": "Şarj ve Marş Dinamosu Rulmanı Ses Durumu",
        "moduleId": "motor",
        "moduleTitle": "MOTOR EKSPERTİZ VE CHECK-UP",
        "statusOptions": [],
        "options": [
          {
            "optionType": "checkbox",
            "value": "1136",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1136"
          },
          {
            "optionType": "checkbox",
            "value": "1137",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1137"
          },
          {
            "optionType": "checkbox",
            "value": "1138",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1138"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 3,
        "labeledOptionCount": 0,
        "placeholderOptionCount": 3,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": true,
          "criticalOptionCountHeuristic": 0
        }
      },
      {
        "order": 33,
        "itemNo": 33,
        "noktaId": "317",
        "itemId": "n317-araca-acil-servis-bakimi-gerekli-mi",
        "title": "Araca Acil Servis Bakımı Gerekli mi?",
        "moduleId": "motor",
        "moduleTitle": "MOTOR EKSPERTİZ VE CHECK-UP",
        "statusOptions": [
          "Hayır",
          "Evet"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "Hayır",
            "label": "Hayır",
            "displayLabel": "Hayır",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Hayır"
          },
          {
            "optionType": "label",
            "value": "Evet",
            "label": "Evet",
            "displayLabel": "Evet",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Evet"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 2,
        "labeledOptionCount": 2,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 1
        }
      },
      {
        "order": 34,
        "itemNo": 34,
        "noktaId": "816",
        "itemId": "n816-aracta-motor-mekanik-olarak-islem-mevcut-mu",
        "title": "Araçta Motor-Mekanik Olarak İşlem Mevcut mu?",
        "moduleId": "motor",
        "moduleTitle": "MOTOR EKSPERTİZ VE CHECK-UP",
        "statusOptions": [
          "Evet",
          "Hayır"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "Evet",
            "label": "Evet",
            "displayLabel": "Evet",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Evet"
          },
          {
            "optionType": "label",
            "value": "Hayır",
            "label": "Hayır",
            "displayLabel": "Hayır",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Hayır"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 2,
        "labeledOptionCount": 2,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 1
        }
      },
      {
        "order": 35,
        "itemNo": 35,
        "noktaId": "482",
        "itemId": "n482-emme-manifoldu-durumu",
        "title": "Emme Manifoldu Durumu",
        "moduleId": "motor",
        "moduleTitle": "MOTOR EKSPERTİZ VE CHECK-UP",
        "statusOptions": [],
        "options": [
          {
            "optionType": "checkbox",
            "value": "2040",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=2040"
          },
          {
            "optionType": "checkbox",
            "value": "2041",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=2041"
          },
          {
            "optionType": "checkbox",
            "value": "2042",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=2042"
          },
          {
            "optionType": "checkbox",
            "value": "2043",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=2043"
          },
          {
            "optionType": "checkbox",
            "value": "5512",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=5512"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 5,
        "labeledOptionCount": 0,
        "placeholderOptionCount": 5,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": true,
          "criticalOptionCountHeuristic": 0
        }
      },
      {
        "order": 36,
        "itemNo": 36,
        "noktaId": "989",
        "itemId": "n989-bu-araci-kendinize-ya-da-bir-akrabaniza-alir-misin",
        "title": "Bu aracı kendinize ya da bir akrabanıza alır mısınız? (Bu soru testte görünmeyecektir.)",
        "moduleId": "motor",
        "moduleTitle": "MOTOR EKSPERTİZ VE CHECK-UP",
        "statusOptions": [
          "Evet",
          "Hayır"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "Evet",
            "label": "Evet",
            "displayLabel": "Evet",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Evet"
          },
          {
            "optionType": "label",
            "value": "Hayır",
            "label": "Hayır",
            "displayLabel": "Hayır",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Hayır"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 2,
        "labeledOptionCount": 2,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 1
        }
      },
      {
        "order": 37,
        "itemNo": 37,
        "noktaId": "1579",
        "itemId": "n1579-conta-kacak-testi-yapildi-mi",
        "title": "Conta Kaçak Testi Yapıldı mı?",
        "moduleId": "motor",
        "moduleTitle": "MOTOR EKSPERTİZ VE CHECK-UP",
        "statusOptions": [
          "Evet, conta kaçak testi satın alınmıştır ve yapılmıştır.",
          "Hayır, conta kaçak testi satın alınmamıştır ve yapılmamıştır."
        ],
        "options": [
          {
            "optionType": "label",
            "value": "Evet, conta kaçak testi satın alınmıştır ve yapılmıştır.",
            "label": "Evet, conta kaçak testi satın alınmıştır ve yapılmıştır.",
            "displayLabel": "Evet, conta kaçak testi satın alınmıştır ve yapılmıştır.",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Evet, conta kaçak testi satın alınmıştır ve yapılmıştır."
          },
          {
            "optionType": "label",
            "value": "Hayır, conta kaçak testi satın alınmamıştır ve yapılmamıştır.",
            "label": "Hayır, conta kaçak testi satın alınmamıştır ve yapılmamıştır.",
            "displayLabel": "Hayır, conta kaçak testi satın alınmamıştır ve yapılmamıştır.",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Hayır, conta kaçak testi satın alınmamıştır ve yapılmamıştır."
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 2,
        "labeledOptionCount": 2,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 2
        }
      }
    ]
  },
  {
    "moduleNo": 2,
    "moduleId": "alt-on-mekanik",
    "key": "alt-on-mekanik",
    "title": "ALT / ÖN / MEKANİK EKSPERTİZ ve CHECK-UP",
    "shortTitle": "Alt / Ön / Mekanik",
    "groupTitle": "ALT / ÖN / MEKANİK EKSPERTİZ ve CHECK-UP",
    "groupTitles": [
      "ALT / ÖN / MEKANİK EKSPERTİZ ve CHECK-UP"
    ],
    "itemCount": 40,
    "items": [
      {
        "order": 1,
        "itemNo": 1,
        "noktaId": "322",
        "itemId": "n322-arac-alt-kismi-hasar-kontrolu",
        "title": "Araç Alt Kısmı Hasar Kontrolü",
        "moduleId": "alt-on-mekanik",
        "moduleTitle": "ALT / ÖN / MEKANİK EKSPERTİZ ve CHECK-UP",
        "statusOptions": [
          "Hasarsız",
          "Hasar Mevcut"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "Hasarsız",
            "label": "Hasarsız",
            "displayLabel": "Hasarsız",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Hasarsız"
          },
          {
            "optionType": "label",
            "value": "Hasar Mevcut",
            "label": "Hasar Mevcut",
            "displayLabel": "Hasar Mevcut",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Hasar Mevcut"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 2,
        "labeledOptionCount": 2,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 2
        }
      },
      {
        "order": 2,
        "itemNo": 2,
        "noktaId": "99",
        "itemId": "n99-motor-muhafaza",
        "title": "Motor Muhafaza",
        "moduleId": "alt-on-mekanik",
        "moduleTitle": "ALT / ÖN / MEKANİK EKSPERTİZ ve CHECK-UP",
        "statusOptions": [
          "İyi",
          "Kırık",
          "Deforme-Hasarlı",
          "Yok"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "İyi",
            "label": "İyi",
            "displayLabel": "İyi",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "İyi"
          },
          {
            "optionType": "label",
            "value": "Kırık",
            "label": "Kırık",
            "displayLabel": "Kırık",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Kırık"
          },
          {
            "optionType": "label",
            "value": "Deforme-Hasarlı",
            "label": "Deforme-Hasarlı",
            "displayLabel": "Deforme-Hasarlı",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Deforme-Hasarlı"
          },
          {
            "optionType": "label",
            "value": "Yok",
            "label": "Yok",
            "displayLabel": "Yok",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Yok"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 4,
        "labeledOptionCount": 4,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 3
        }
      },
      {
        "order": 3,
        "itemNo": 3,
        "noktaId": "100",
        "itemId": "n100-motor-karteri-yag-sizdirmazligi",
        "title": "Motor Karteri Yağ Sızdırmazlığı",
        "moduleId": "alt-on-mekanik",
        "moduleTitle": "ALT / ÖN / MEKANİK EKSPERTİZ ve CHECK-UP",
        "statusOptions": [],
        "options": [
          {
            "optionType": "checkbox",
            "value": "241",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=241"
          },
          {
            "optionType": "checkbox",
            "value": "207",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=207"
          },
          {
            "optionType": "checkbox",
            "value": "173",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=173"
          },
          {
            "optionType": "checkbox",
            "value": "1199",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1199"
          },
          {
            "optionType": "checkbox",
            "value": "1198",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1198"
          },
          {
            "optionType": "checkbox",
            "value": "7282",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=7282"
          },
          {
            "optionType": "checkbox",
            "value": "7283",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=7283"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 7,
        "labeledOptionCount": 0,
        "placeholderOptionCount": 7,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": true,
          "criticalOptionCountHeuristic": 0
        }
      },
      {
        "order": 4,
        "itemNo": 4,
        "noktaId": "263",
        "itemId": "n263-on-krank-kecesi-yag-sizdirmazligi",
        "title": "Ön Krank Keçesi Yağ Sızdırmazlığı",
        "moduleId": "alt-on-mekanik",
        "moduleTitle": "ALT / ÖN / MEKANİK EKSPERTİZ ve CHECK-UP",
        "statusOptions": [],
        "options": [
          {
            "optionType": "checkbox",
            "value": "1188",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1188"
          },
          {
            "optionType": "checkbox",
            "value": "1190",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1190"
          },
          {
            "optionType": "checkbox",
            "value": "1189",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1189"
          },
          {
            "optionType": "checkbox",
            "value": "1192",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1192"
          },
          {
            "optionType": "checkbox",
            "value": "1191",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1191"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 5,
        "labeledOptionCount": 0,
        "placeholderOptionCount": 5,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": true,
          "criticalOptionCountHeuristic": 0
        }
      },
      {
        "order": 5,
        "itemNo": 5,
        "noktaId": "108",
        "itemId": "n108-sanziman-ve-diferansiyel-yag-sizdirmazligi",
        "title": "Şanzıman ve Diferansiyel Yağ Sızdırmazlığı",
        "moduleId": "alt-on-mekanik",
        "moduleTitle": "ALT / ÖN / MEKANİK EKSPERTİZ ve CHECK-UP",
        "statusOptions": [
          "İyi",
          "Orta",
          "Kötü",
          "Terleme Mevcut",
          "Yağ Kaçağı Mevcut"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "İyi",
            "label": "İyi",
            "displayLabel": "İyi",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "İyi"
          },
          {
            "optionType": "label",
            "value": "Orta",
            "label": "Orta",
            "displayLabel": "Orta",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Orta"
          },
          {
            "optionType": "label",
            "value": "Kötü",
            "label": "Kötü",
            "displayLabel": "Kötü",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Kötü"
          },
          {
            "optionType": "label",
            "value": "Terleme Mevcut",
            "label": "Terleme Mevcut",
            "displayLabel": "Terleme Mevcut",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Terleme Mevcut"
          },
          {
            "optionType": "label",
            "value": "Yağ Kaçağı Mevcut",
            "label": "Yağ Kaçağı Mevcut",
            "displayLabel": "Yağ Kaçağı Mevcut",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Yağ Kaçağı Mevcut"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 5,
        "labeledOptionCount": 5,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 2
        }
      },
      {
        "order": 6,
        "itemNo": 6,
        "noktaId": "97",
        "itemId": "n97-yag-sizdirmazlik-on-diferansiyel",
        "title": "Yağ Sızdırmazlık Ön Diferansiyel",
        "moduleId": "alt-on-mekanik",
        "moduleTitle": "ALT / ÖN / MEKANİK EKSPERTİZ ve CHECK-UP",
        "statusOptions": [
          "İyi",
          "Orta",
          "Kötü",
          "Yok"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "İyi",
            "label": "İyi",
            "displayLabel": "İyi",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "İyi"
          },
          {
            "optionType": "label",
            "value": "Orta",
            "label": "Orta",
            "displayLabel": "Orta",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Orta"
          },
          {
            "optionType": "label",
            "value": "Kötü",
            "label": "Kötü",
            "displayLabel": "Kötü",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Kötü"
          },
          {
            "optionType": "label",
            "value": "Yok",
            "label": "Yok",
            "displayLabel": "Yok",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Yok"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 4,
        "labeledOptionCount": 4,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 2
        }
      },
      {
        "order": 7,
        "itemNo": 7,
        "noktaId": "93",
        "itemId": "n93-on-aks-ve-aks-korukleri",
        "title": "Ön Aks ve Aks Körükleri",
        "moduleId": "alt-on-mekanik",
        "moduleTitle": "ALT / ÖN / MEKANİK EKSPERTİZ ve CHECK-UP",
        "statusOptions": [
          "İyi",
          "Orta",
          "Kötü",
          "Yok"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "İyi",
            "label": "İyi",
            "displayLabel": "İyi",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "İyi"
          },
          {
            "optionType": "label",
            "value": "Orta",
            "label": "Orta",
            "displayLabel": "Orta",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Orta"
          },
          {
            "optionType": "label",
            "value": "Kötü",
            "label": "Kötü",
            "displayLabel": "Kötü",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Kötü"
          },
          {
            "optionType": "label",
            "value": "Yok",
            "label": "Yok",
            "displayLabel": "Yok",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Yok"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 4,
        "labeledOptionCount": 4,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 2
        }
      },
      {
        "order": 8,
        "itemNo": 8,
        "noktaId": "254",
        "itemId": "n254-sag-sol-on-fren-kaliperi-hidrolik-sizdirmazligi",
        "title": "Sağ-Sol Ön Fren Kaliperi Hidrolik Sızdırmazlığı",
        "moduleId": "alt-on-mekanik",
        "moduleTitle": "ALT / ÖN / MEKANİK EKSPERTİZ ve CHECK-UP",
        "statusOptions": [
          "İyi",
          "Orta",
          "Kötü"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "İyi",
            "label": "İyi",
            "displayLabel": "İyi",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "İyi"
          },
          {
            "optionType": "label",
            "value": "Orta",
            "label": "Orta",
            "displayLabel": "Orta",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Orta"
          },
          {
            "optionType": "label",
            "value": "Kötü",
            "label": "Kötü",
            "displayLabel": "Kötü",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Kötü"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 3,
        "labeledOptionCount": 3,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 1
        }
      },
      {
        "order": 9,
        "itemNo": 9,
        "noktaId": "104",
        "itemId": "n104-on-fren-balata-ve-diskler",
        "title": "Ön Fren Balata ve Diskler",
        "moduleId": "alt-on-mekanik",
        "moduleTitle": "ALT / ÖN / MEKANİK EKSPERTİZ ve CHECK-UP",
        "statusOptions": [
          "İyi",
          "Orta",
          "Kötü"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "İyi",
            "label": "İyi",
            "displayLabel": "İyi",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "İyi"
          },
          {
            "optionType": "label",
            "value": "Orta",
            "label": "Orta",
            "displayLabel": "Orta",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Orta"
          },
          {
            "optionType": "label",
            "value": "Kötü",
            "label": "Kötü",
            "displayLabel": "Kötü",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Kötü"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 3,
        "labeledOptionCount": 3,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 1
        }
      },
      {
        "order": 10,
        "itemNo": 10,
        "noktaId": "256",
        "itemId": "n256-sol-on-rotil-rot-kolu-ve-rot-basi",
        "title": "Sol Ön Rotil, Rot Kolu ve Rot Başı",
        "moduleId": "alt-on-mekanik",
        "moduleTitle": "ALT / ÖN / MEKANİK EKSPERTİZ ve CHECK-UP",
        "statusOptions": [
          "İyi",
          "Orta",
          "Kötü"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "İyi",
            "label": "İyi",
            "displayLabel": "İyi",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "İyi"
          },
          {
            "optionType": "label",
            "value": "Orta",
            "label": "Orta",
            "displayLabel": "Orta",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Orta"
          },
          {
            "optionType": "label",
            "value": "Kötü",
            "label": "Kötü",
            "displayLabel": "Kötü",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Kötü"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 3,
        "labeledOptionCount": 3,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 1
        }
      },
      {
        "order": 11,
        "itemNo": 11,
        "noktaId": "261",
        "itemId": "n261-sag-on-rotil-rot-kolu-ve-rot-basi",
        "title": "Sağ Ön Rotil, Rot Kolu ve Rot Başı",
        "moduleId": "alt-on-mekanik",
        "moduleTitle": "ALT / ÖN / MEKANİK EKSPERTİZ ve CHECK-UP",
        "statusOptions": [
          "İyi",
          "Orta",
          "Kötü"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "İyi",
            "label": "İyi",
            "displayLabel": "İyi",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "İyi"
          },
          {
            "optionType": "label",
            "value": "Orta",
            "label": "Orta",
            "displayLabel": "Orta",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Orta"
          },
          {
            "optionType": "label",
            "value": "Kötü",
            "label": "Kötü",
            "displayLabel": "Kötü",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Kötü"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 3,
        "labeledOptionCount": 3,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 1
        }
      },
      {
        "order": 12,
        "itemNo": 12,
        "noktaId": "95",
        "itemId": "n95-sol-on-salincak-fisegi",
        "title": "Sol Ön Salıncak Fişeği",
        "moduleId": "alt-on-mekanik",
        "moduleTitle": "ALT / ÖN / MEKANİK EKSPERTİZ ve CHECK-UP",
        "statusOptions": [
          "İyi",
          "Orta",
          "Kötü",
          "Deforme"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "İyi",
            "label": "İyi",
            "displayLabel": "İyi",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "İyi"
          },
          {
            "optionType": "label",
            "value": "Orta",
            "label": "Orta",
            "displayLabel": "Orta",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Orta"
          },
          {
            "optionType": "label",
            "value": "Kötü",
            "label": "Kötü",
            "displayLabel": "Kötü",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Kötü"
          },
          {
            "optionType": "label",
            "value": "Deforme",
            "label": "Deforme",
            "displayLabel": "Deforme",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Deforme"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 4,
        "labeledOptionCount": 4,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 2
        }
      },
      {
        "order": 13,
        "itemNo": 13,
        "noktaId": "105",
        "itemId": "n105-sag-on-salincak-fisegi",
        "title": "Sağ Ön Salıncak Fişeği",
        "moduleId": "alt-on-mekanik",
        "moduleTitle": "ALT / ÖN / MEKANİK EKSPERTİZ ve CHECK-UP",
        "statusOptions": [
          "İyi",
          "Orta",
          "Kötü",
          "Deforme"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "İyi",
            "label": "İyi",
            "displayLabel": "İyi",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "İyi"
          },
          {
            "optionType": "label",
            "value": "Orta",
            "label": "Orta",
            "displayLabel": "Orta",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Orta"
          },
          {
            "optionType": "label",
            "value": "Kötü",
            "label": "Kötü",
            "displayLabel": "Kötü",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Kötü"
          },
          {
            "optionType": "label",
            "value": "Deforme",
            "label": "Deforme",
            "displayLabel": "Deforme",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Deforme"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 4,
        "labeledOptionCount": 4,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 2
        }
      },
      {
        "order": 14,
        "itemNo": 14,
        "noktaId": "301",
        "itemId": "n301-sol-on-amortisor",
        "title": "Sol Ön Amortisör",
        "moduleId": "alt-on-mekanik",
        "moduleTitle": "ALT / ÖN / MEKANİK EKSPERTİZ ve CHECK-UP",
        "statusOptions": [],
        "options": [
          {
            "optionType": "checkbox",
            "value": "1529",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1529"
          },
          {
            "optionType": "checkbox",
            "value": "1530",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1530"
          },
          {
            "optionType": "checkbox",
            "value": "1531",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1531"
          },
          {
            "optionType": "checkbox",
            "value": "1532",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1532"
          },
          {
            "optionType": "checkbox",
            "value": "1533",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1533"
          },
          {
            "optionType": "checkbox",
            "value": "5542",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=5542"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 6,
        "labeledOptionCount": 0,
        "placeholderOptionCount": 6,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": true,
          "criticalOptionCountHeuristic": 0
        }
      },
      {
        "order": 15,
        "itemNo": 15,
        "noktaId": "103",
        "itemId": "n103-sag-on-amortisor",
        "title": "Sağ Ön Amortisör",
        "moduleId": "alt-on-mekanik",
        "moduleTitle": "ALT / ÖN / MEKANİK EKSPERTİZ ve CHECK-UP",
        "statusOptions": [],
        "options": [
          {
            "optionType": "checkbox",
            "value": "244",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=244"
          },
          {
            "optionType": "checkbox",
            "value": "210",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=210"
          },
          {
            "optionType": "checkbox",
            "value": "176",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=176"
          },
          {
            "optionType": "checkbox",
            "value": "5452",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=5452"
          },
          {
            "optionType": "checkbox",
            "value": "5453",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=5453"
          },
          {
            "optionType": "checkbox",
            "value": "5543",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=5543"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 6,
        "labeledOptionCount": 0,
        "placeholderOptionCount": 6,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": true,
          "criticalOptionCountHeuristic": 0
        }
      },
      {
        "order": 16,
        "itemNo": 16,
        "noktaId": "323",
        "itemId": "n323-turbo-alt-kontrolu",
        "title": "Turbo Alt Kontrolü",
        "moduleId": "alt-on-mekanik",
        "moduleTitle": "ALT / ÖN / MEKANİK EKSPERTİZ ve CHECK-UP",
        "statusOptions": [
          "Sorunsuz",
          "Orta",
          "Kötü",
          "Turbo Yok"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "Sorunsuz",
            "label": "Sorunsuz",
            "displayLabel": "Sorunsuz",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Sorunsuz"
          },
          {
            "optionType": "label",
            "value": "Orta",
            "label": "Orta",
            "displayLabel": "Orta",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Orta"
          },
          {
            "optionType": "label",
            "value": "Kötü",
            "label": "Kötü",
            "displayLabel": "Kötü",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Kötü"
          },
          {
            "optionType": "label",
            "value": "Turbo Yok",
            "label": "Turbo Yok",
            "displayLabel": "Turbo Yok",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Turbo Yok"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 4,
        "labeledOptionCount": 4,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 2
        }
      },
      {
        "order": 17,
        "itemNo": 17,
        "noktaId": "265",
        "itemId": "n265-yag-sogutucusu-yag-sizdirmazligi",
        "title": "Yağ Soğutucusu Yağ Sızdırmazlığı",
        "moduleId": "alt-on-mekanik",
        "moduleTitle": "ALT / ÖN / MEKANİK EKSPERTİZ ve CHECK-UP",
        "statusOptions": [],
        "options": [
          {
            "optionType": "checkbox",
            "value": "1200",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1200"
          },
          {
            "optionType": "checkbox",
            "value": "1201",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1201"
          },
          {
            "optionType": "checkbox",
            "value": "1202",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1202"
          },
          {
            "optionType": "checkbox",
            "value": "1203",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1203"
          },
          {
            "optionType": "checkbox",
            "value": "1204",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1204"
          },
          {
            "optionType": "checkbox",
            "value": "8163",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=8163"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 6,
        "labeledOptionCount": 0,
        "placeholderOptionCount": 6,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": true,
          "criticalOptionCountHeuristic": 0
        }
      },
      {
        "order": 18,
        "itemNo": 18,
        "noktaId": "90",
        "itemId": "n90-motor-ve-sanziman-alt-takozlari",
        "title": "Motor ve Şanzıman Alt Takozları",
        "moduleId": "alt-on-mekanik",
        "moduleTitle": "ALT / ÖN / MEKANİK EKSPERTİZ ve CHECK-UP",
        "statusOptions": [],
        "options": [
          {
            "optionType": "checkbox",
            "value": "231",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=231"
          },
          {
            "optionType": "checkbox",
            "value": "197",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=197"
          },
          {
            "optionType": "checkbox",
            "value": "163",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=163"
          },
          {
            "optionType": "checkbox",
            "value": "8657",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=8657"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 4,
        "labeledOptionCount": 0,
        "placeholderOptionCount": 4,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": true,
          "criticalOptionCountHeuristic": 0
        }
      },
      {
        "order": 19,
        "itemNo": 19,
        "noktaId": "89",
        "itemId": "n89-taban-plastik-bakalitleri",
        "title": "Taban Plastik Bakalitleri",
        "moduleId": "alt-on-mekanik",
        "moduleTitle": "ALT / ÖN / MEKANİK EKSPERTİZ ve CHECK-UP",
        "statusOptions": [
          "İyi",
          "Orta",
          "Kötü",
          "Yok"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "İyi",
            "label": "İyi",
            "displayLabel": "İyi",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "İyi"
          },
          {
            "optionType": "label",
            "value": "Orta",
            "label": "Orta",
            "displayLabel": "Orta",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Orta"
          },
          {
            "optionType": "label",
            "value": "Kötü",
            "label": "Kötü",
            "displayLabel": "Kötü",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Kötü"
          },
          {
            "optionType": "label",
            "value": "Yok",
            "label": "Yok",
            "displayLabel": "Yok",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Yok"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 4,
        "labeledOptionCount": 4,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 2
        }
      },
      {
        "order": 20,
        "itemNo": 20,
        "noktaId": "111",
        "itemId": "n111-diferansiyel-tranmisyon-mili-ve-takoz",
        "title": "Diferansiyel Tranmisyon Mili ve Takoz",
        "moduleId": "alt-on-mekanik",
        "moduleTitle": "ALT / ÖN / MEKANİK EKSPERTİZ ve CHECK-UP",
        "statusOptions": [
          "İyi",
          "Orta",
          "Kötü",
          "Yok"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "İyi",
            "label": "İyi",
            "displayLabel": "İyi",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "İyi"
          },
          {
            "optionType": "label",
            "value": "Orta",
            "label": "Orta",
            "displayLabel": "Orta",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Orta"
          },
          {
            "optionType": "label",
            "value": "Kötü",
            "label": "Kötü",
            "displayLabel": "Kötü",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Kötü"
          },
          {
            "optionType": "label",
            "value": "Yok",
            "label": "Yok",
            "displayLabel": "Yok",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Yok"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 4,
        "labeledOptionCount": 4,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 2
        }
      },
      {
        "order": 21,
        "itemNo": 21,
        "noktaId": "110",
        "itemId": "n110-torsiyon-burc-denge-kollari-ve-salincak-burc-fisek",
        "title": "Torsiyon Burç-Denge Kolları ve Salıncak Burç-Fişekleri",
        "moduleId": "alt-on-mekanik",
        "moduleTitle": "ALT / ÖN / MEKANİK EKSPERTİZ ve CHECK-UP",
        "statusOptions": [],
        "options": [
          {
            "optionType": "checkbox",
            "value": "251",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=251"
          },
          {
            "optionType": "checkbox",
            "value": "217",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=217"
          },
          {
            "optionType": "checkbox",
            "value": "183",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=183"
          },
          {
            "optionType": "checkbox",
            "value": "8658",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=8658"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 4,
        "labeledOptionCount": 0,
        "placeholderOptionCount": 4,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": true,
          "criticalOptionCountHeuristic": 0
        }
      },
      {
        "order": 22,
        "itemNo": 22,
        "noktaId": "273",
        "itemId": "n273-debriyaj-balatasi-ve-kavrama-sistemi-durumu",
        "title": "Debriyaj Balatası ve Kavrama Sistemi Durumu",
        "moduleId": "alt-on-mekanik",
        "moduleTitle": "ALT / ÖN / MEKANİK EKSPERTİZ ve CHECK-UP",
        "statusOptions": [],
        "options": [
          {
            "optionType": "checkbox",
            "value": "1241",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1241"
          },
          {
            "optionType": "checkbox",
            "value": "1242",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1242"
          },
          {
            "optionType": "checkbox",
            "value": "1243",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1243"
          },
          {
            "optionType": "checkbox",
            "value": "1244",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1244"
          },
          {
            "optionType": "checkbox",
            "value": "1245",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1245"
          },
          {
            "optionType": "checkbox",
            "value": "1737",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1737"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 6,
        "labeledOptionCount": 0,
        "placeholderOptionCount": 6,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": true,
          "criticalOptionCountHeuristic": 0
        }
      },
      {
        "order": 23,
        "itemNo": 23,
        "noktaId": "87",
        "itemId": "n87-arka-diferansiyel-bosluk-ve-yag-sizdirmazlik",
        "title": "Arka Diferansiyel Boşluk ve Yağ Sızdırmazlık",
        "moduleId": "alt-on-mekanik",
        "moduleTitle": "ALT / ÖN / MEKANİK EKSPERTİZ ve CHECK-UP",
        "statusOptions": [],
        "options": [
          {
            "optionType": "checkbox",
            "value": "228",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=228"
          },
          {
            "optionType": "checkbox",
            "value": "194",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=194"
          },
          {
            "optionType": "checkbox",
            "value": "160",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=160"
          },
          {
            "optionType": "checkbox",
            "value": "934",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=934"
          },
          {
            "optionType": "checkbox",
            "value": "1214",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1214"
          },
          {
            "optionType": "checkbox",
            "value": "1215",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1215"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 6,
        "labeledOptionCount": 0,
        "placeholderOptionCount": 6,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": true,
          "criticalOptionCountHeuristic": 0
        }
      },
      {
        "order": 24,
        "itemNo": 24,
        "noktaId": "266",
        "itemId": "n266-arazi-safti-genel-durumu",
        "title": "Arazi Şaftı Genel Durumu",
        "moduleId": "alt-on-mekanik",
        "moduleTitle": "ALT / ÖN / MEKANİK EKSPERTİZ ve CHECK-UP",
        "statusOptions": [],
        "options": [
          {
            "optionType": "checkbox",
            "value": "1209",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1209"
          },
          {
            "optionType": "checkbox",
            "value": "1210",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1210"
          },
          {
            "optionType": "checkbox",
            "value": "1211",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1211"
          },
          {
            "optionType": "checkbox",
            "value": "1401",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1401"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 4,
        "labeledOptionCount": 0,
        "placeholderOptionCount": 4,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": true,
          "criticalOptionCountHeuristic": 0
        }
      },
      {
        "order": 25,
        "itemNo": 25,
        "noktaId": "91",
        "itemId": "n91-arazi-sanzimani-yag-sizdirmazligi",
        "title": "Arazi Şanzımanı Yağ Sızdırmazlığı",
        "moduleId": "alt-on-mekanik",
        "moduleTitle": "ALT / ÖN / MEKANİK EKSPERTİZ ve CHECK-UP",
        "statusOptions": [],
        "options": [
          {
            "optionType": "checkbox",
            "value": "232",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=232"
          },
          {
            "optionType": "checkbox",
            "value": "198",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=198"
          },
          {
            "optionType": "checkbox",
            "value": "164",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=164"
          },
          {
            "optionType": "checkbox",
            "value": "1208",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1208"
          },
          {
            "optionType": "checkbox",
            "value": "1207",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1207"
          },
          {
            "optionType": "checkbox",
            "value": "1206",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1206"
          },
          {
            "optionType": "checkbox",
            "value": "1205",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1205"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 7,
        "labeledOptionCount": 0,
        "placeholderOptionCount": 7,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": true,
          "criticalOptionCountHeuristic": 0
        }
      },
      {
        "order": 26,
        "itemNo": 26,
        "noktaId": "115",
        "itemId": "n115-yakit-deposu-ve-yakit-hortumlari",
        "title": "Yakıt Deposu ve Yakıt Hortumları",
        "moduleId": "alt-on-mekanik",
        "moduleTitle": "ALT / ÖN / MEKANİK EKSPERTİZ ve CHECK-UP",
        "statusOptions": [],
        "options": [
          {
            "optionType": "checkbox",
            "value": "256",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=256"
          },
          {
            "optionType": "checkbox",
            "value": "222",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=222"
          },
          {
            "optionType": "checkbox",
            "value": "188",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=188"
          },
          {
            "optionType": "checkbox",
            "value": "1239",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1239"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 4,
        "labeledOptionCount": 0,
        "placeholderOptionCount": 4,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": true,
          "criticalOptionCountHeuristic": 0
        }
      },
      {
        "order": 27,
        "itemNo": 27,
        "noktaId": "116",
        "itemId": "n116-egzoz-borusu-ve-susturucu-genel-durumu",
        "title": "Egzoz Borusu ve Susturucu Genel Durumu",
        "moduleId": "alt-on-mekanik",
        "moduleTitle": "ALT / ÖN / MEKANİK EKSPERTİZ ve CHECK-UP",
        "statusOptions": [],
        "options": [
          {
            "optionType": "checkbox",
            "value": "257",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=257"
          },
          {
            "optionType": "checkbox",
            "value": "223",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=223"
          },
          {
            "optionType": "checkbox",
            "value": "189",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=189"
          },
          {
            "optionType": "checkbox",
            "value": "1240",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1240"
          },
          {
            "optionType": "checkbox",
            "value": "4804",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=4804"
          },
          {
            "optionType": "checkbox",
            "value": "8609",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=8609"
          },
          {
            "optionType": "checkbox",
            "value": "8630",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=8630"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 7,
        "labeledOptionCount": 0,
        "placeholderOptionCount": 7,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": true,
          "criticalOptionCountHeuristic": 0
        }
      },
      {
        "order": 28,
        "itemNo": 28,
        "noktaId": "109",
        "itemId": "n109-el-freni-halatlari",
        "title": "El Freni Halatları",
        "moduleId": "alt-on-mekanik",
        "moduleTitle": "ALT / ÖN / MEKANİK EKSPERTİZ ve CHECK-UP",
        "statusOptions": [
          "İyi",
          "Orta",
          "Kötü",
          "Yok (Elektrikli El Freni Mevcut)"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "İyi",
            "label": "İyi",
            "displayLabel": "İyi",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "İyi"
          },
          {
            "optionType": "label",
            "value": "Orta",
            "label": "Orta",
            "displayLabel": "Orta",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Orta"
          },
          {
            "optionType": "label",
            "value": "Kötü",
            "label": "Kötü",
            "displayLabel": "Kötü",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Kötü"
          },
          {
            "optionType": "label",
            "value": "Yok (Elektrikli El Freni Mevcut)",
            "label": "Yok (Elektrikli El Freni Mevcut)",
            "displayLabel": "Yok (Elektrikli El Freni Mevcut)",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Yok (Elektrikli El Freni Mevcut)"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 4,
        "labeledOptionCount": 4,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 2
        }
      },
      {
        "order": 29,
        "itemNo": 29,
        "noktaId": "85",
        "itemId": "n85-arka-fren-balatalari-ve-diskler",
        "title": "Arka Fren Balataları ve Diskler",
        "moduleId": "alt-on-mekanik",
        "moduleTitle": "ALT / ÖN / MEKANİK EKSPERTİZ ve CHECK-UP",
        "statusOptions": [],
        "options": [
          {
            "optionType": "checkbox",
            "value": "226",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=226"
          },
          {
            "optionType": "checkbox",
            "value": "192",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=192"
          },
          {
            "optionType": "checkbox",
            "value": "158",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=158"
          },
          {
            "optionType": "checkbox",
            "value": "1235",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1235"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 4,
        "labeledOptionCount": 0,
        "placeholderOptionCount": 4,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": true,
          "criticalOptionCountHeuristic": 0
        }
      },
      {
        "order": 30,
        "itemNo": 30,
        "noktaId": "83",
        "itemId": "n83-sol-arka-amortisor-ve-helezon-yaylari",
        "title": "Sol Arka Amortisör ve Helezon Yayları",
        "moduleId": "alt-on-mekanik",
        "moduleTitle": "ALT / ÖN / MEKANİK EKSPERTİZ ve CHECK-UP",
        "statusOptions": [],
        "options": [
          {
            "optionType": "checkbox",
            "value": "224",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=224"
          },
          {
            "optionType": "checkbox",
            "value": "190",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=190"
          },
          {
            "optionType": "checkbox",
            "value": "156",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=156"
          },
          {
            "optionType": "checkbox",
            "value": "1396",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1396"
          },
          {
            "optionType": "checkbox",
            "value": "1397",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1397"
          },
          {
            "optionType": "checkbox",
            "value": "5544",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=5544"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 6,
        "labeledOptionCount": 0,
        "placeholderOptionCount": 6,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": true,
          "criticalOptionCountHeuristic": 0
        }
      },
      {
        "order": 31,
        "itemNo": 31,
        "noktaId": "113",
        "itemId": "n113-sag-arka-amortisor-ve-helezon-yaylari",
        "title": "Sağ Arka Amortisör ve Helezon Yayları",
        "moduleId": "alt-on-mekanik",
        "moduleTitle": "ALT / ÖN / MEKANİK EKSPERTİZ ve CHECK-UP",
        "statusOptions": [],
        "options": [
          {
            "optionType": "checkbox",
            "value": "254",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=254"
          },
          {
            "optionType": "checkbox",
            "value": "220",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=220"
          },
          {
            "optionType": "checkbox",
            "value": "186",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=186"
          },
          {
            "optionType": "checkbox",
            "value": "1224",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1224"
          },
          {
            "optionType": "checkbox",
            "value": "1225",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1225"
          },
          {
            "optionType": "checkbox",
            "value": "5545",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=5545"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 6,
        "labeledOptionCount": 0,
        "placeholderOptionCount": 6,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": true,
          "criticalOptionCountHeuristic": 0
        }
      },
      {
        "order": 32,
        "itemNo": 32,
        "noktaId": "114",
        "itemId": "n114-arka-aks-ve-aks-korukleri",
        "title": "Arka Aks ve Aks Körükleri",
        "moduleId": "alt-on-mekanik",
        "moduleTitle": "ALT / ÖN / MEKANİK EKSPERTİZ ve CHECK-UP",
        "statusOptions": [
          "İyi",
          "Orta",
          "Kötü",
          "Yok"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "İyi",
            "label": "İyi",
            "displayLabel": "İyi",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "İyi"
          },
          {
            "optionType": "label",
            "value": "Orta",
            "label": "Orta",
            "displayLabel": "Orta",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Orta"
          },
          {
            "optionType": "label",
            "value": "Kötü",
            "label": "Kötü",
            "displayLabel": "Kötü",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Kötü"
          },
          {
            "optionType": "label",
            "value": "Yok",
            "label": "Yok",
            "displayLabel": "Yok",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Yok"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 4,
        "labeledOptionCount": 4,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 2
        }
      },
      {
        "order": 33,
        "itemNo": 33,
        "noktaId": "264",
        "itemId": "n264-arka-krank-kecesi-yag-sizdirmazligi",
        "title": "Arka Krank Keçesi Yağ Sızdırmazlığı",
        "moduleId": "alt-on-mekanik",
        "moduleTitle": "ALT / ÖN / MEKANİK EKSPERTİZ ve CHECK-UP",
        "statusOptions": [],
        "options": [
          {
            "optionType": "checkbox",
            "value": "1193",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1193"
          },
          {
            "optionType": "checkbox",
            "value": "1194",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1194"
          },
          {
            "optionType": "checkbox",
            "value": "1195",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1195"
          },
          {
            "optionType": "checkbox",
            "value": "1197",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1197"
          },
          {
            "optionType": "checkbox",
            "value": "1196",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1196"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 5,
        "labeledOptionCount": 0,
        "placeholderOptionCount": 5,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": true,
          "criticalOptionCountHeuristic": 0
        }
      },
      {
        "order": 34,
        "itemNo": 34,
        "noktaId": "268",
        "itemId": "n268-sag-sol-arka-fren-kaliperi-yag-sizdirmazligi",
        "title": "Sağ-Sol Arka Fren Kaliperi Yağ Sızdırmazlığı",
        "moduleId": "alt-on-mekanik",
        "moduleTitle": "ALT / ÖN / MEKANİK EKSPERTİZ ve CHECK-UP",
        "statusOptions": [],
        "options": [
          {
            "optionType": "checkbox",
            "value": "1216",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1216"
          },
          {
            "optionType": "checkbox",
            "value": "1217",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1217"
          },
          {
            "optionType": "checkbox",
            "value": "1218",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1218"
          },
          {
            "optionType": "checkbox",
            "value": "1220",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1220"
          },
          {
            "optionType": "checkbox",
            "value": "1219",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1219"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 5,
        "labeledOptionCount": 0,
        "placeholderOptionCount": 5,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": true,
          "criticalOptionCountHeuristic": 0
        }
      },
      {
        "order": 35,
        "itemNo": 35,
        "noktaId": "371",
        "itemId": "n371-araca-rot-balans-ayari-ya-da-kontrolu-gerekli-mi",
        "title": "Araca Rot-Balans Ayarı ya da Kontrolü Gerekli Mi?",
        "moduleId": "alt-on-mekanik",
        "moduleTitle": "ALT / ÖN / MEKANİK EKSPERTİZ ve CHECK-UP",
        "statusOptions": [
          "Hayır",
          "Evet"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "Hayır",
            "label": "Hayır",
            "displayLabel": "Hayır",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Hayır"
          },
          {
            "optionType": "label",
            "value": "Evet",
            "label": "Evet",
            "displayLabel": "Evet",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Evet"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 2,
        "labeledOptionCount": 2,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 1
        }
      },
      {
        "order": 36,
        "itemNo": 36,
        "noktaId": "965",
        "itemId": "n965-airmatik",
        "title": "Airmatik",
        "moduleId": "alt-on-mekanik",
        "moduleTitle": "ALT / ÖN / MEKANİK EKSPERTİZ ve CHECK-UP",
        "statusOptions": [
          "Çalışıyor",
          "Çalışmıyor",
          "Yok"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "Çalışıyor",
            "label": "Çalışıyor",
            "displayLabel": "Çalışıyor",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Çalışıyor"
          },
          {
            "optionType": "label",
            "value": "Çalışmıyor",
            "label": "Çalışmıyor",
            "displayLabel": "Çalışmıyor",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Çalışmıyor"
          },
          {
            "optionType": "label",
            "value": "Yok",
            "label": "Yok",
            "displayLabel": "Yok",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Yok"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 3,
        "labeledOptionCount": 3,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 2
        }
      },
      {
        "order": 37,
        "itemNo": 37,
        "noktaId": "693",
        "itemId": "n693-direksiyon-kutusu-yag-sizdirmazligi",
        "title": "Direksiyon Kutusu Yağ Sızdırmazlığı",
        "moduleId": "alt-on-mekanik",
        "moduleTitle": "ALT / ÖN / MEKANİK EKSPERTİZ ve CHECK-UP",
        "statusOptions": [],
        "options": [
          {
            "optionType": "checkbox",
            "value": "3058",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=3058"
          },
          {
            "optionType": "checkbox",
            "value": "3059",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=3059"
          },
          {
            "optionType": "checkbox",
            "value": "3060",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=3060"
          },
          {
            "optionType": "checkbox",
            "value": "3061",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=3061"
          },
          {
            "optionType": "checkbox",
            "value": "4805",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=4805"
          },
          {
            "optionType": "checkbox",
            "value": "7300",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=7300"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 6,
        "labeledOptionCount": 0,
        "placeholderOptionCount": 6,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": true,
          "criticalOptionCountHeuristic": 0
        }
      },
      {
        "order": 38,
        "itemNo": 38,
        "noktaId": "1228",
        "itemId": "n1228-lastiklerin-genel-durumu",
        "title": "Lastiklerin Genel Durumu",
        "moduleId": "alt-on-mekanik",
        "moduleTitle": "ALT / ÖN / MEKANİK EKSPERTİZ ve CHECK-UP",
        "statusOptions": [],
        "options": [
          {
            "optionType": "checkbox",
            "value": "5455",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=5455"
          },
          {
            "optionType": "checkbox",
            "value": "5456",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=5456"
          },
          {
            "optionType": "checkbox",
            "value": "5457",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=5457"
          },
          {
            "optionType": "checkbox",
            "value": "8624",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=8624"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 4,
        "labeledOptionCount": 0,
        "placeholderOptionCount": 4,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": true,
          "criticalOptionCountHeuristic": 0
        }
      },
      {
        "order": 39,
        "itemNo": 39,
        "noktaId": "106",
        "itemId": "n106-on-fren-hortumlari",
        "title": "Ön Fren Hortumları",
        "moduleId": "alt-on-mekanik",
        "moduleTitle": "ALT / ÖN / MEKANİK EKSPERTİZ ve CHECK-UP",
        "statusOptions": [
          "İyi",
          "Orta",
          "Kötü"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "İyi",
            "label": "İyi",
            "displayLabel": "İyi",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "İyi"
          },
          {
            "optionType": "label",
            "value": "Orta",
            "label": "Orta",
            "displayLabel": "Orta",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Orta"
          },
          {
            "optionType": "label",
            "value": "Kötü",
            "label": "Kötü",
            "displayLabel": "Kötü",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Kötü"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 3,
        "labeledOptionCount": 3,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 1
        }
      },
      {
        "order": 40,
        "itemNo": 40,
        "noktaId": "1253",
        "itemId": "n1253-arka-fren-hortumlari",
        "title": "Arka Fren Hortumları",
        "moduleId": "alt-on-mekanik",
        "moduleTitle": "ALT / ÖN / MEKANİK EKSPERTİZ ve CHECK-UP",
        "statusOptions": [],
        "options": [
          {
            "optionType": "checkbox",
            "value": "5517",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=5517"
          },
          {
            "optionType": "checkbox",
            "value": "5518",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=5518"
          },
          {
            "optionType": "checkbox",
            "value": "5519",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=5519"
          },
          {
            "optionType": "checkbox",
            "value": "5520",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=5520"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 4,
        "labeledOptionCount": 0,
        "placeholderOptionCount": 4,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": true,
          "criticalOptionCountHeuristic": 0
        }
      }
    ]
  },
  {
    "moduleNo": 3,
    "moduleId": "fren-suspansiyon",
    "key": "fren-suspansiyon",
    "title": "FREN / SÜSPANSİYON TESTİ",
    "shortTitle": "Fren / Süspansiyon",
    "groupTitle": "FREN / SÜSPANSİYON TESTİ",
    "groupTitles": [
      "FREN / SÜSPANSİYON TESTİ"
    ],
    "itemCount": 9,
    "items": [
      {
        "order": 1,
        "itemNo": 1,
        "noktaId": "286",
        "itemId": "n286-el-freni-verimliligi",
        "title": "El Freni Verimliliği",
        "moduleId": "fren-suspansiyon",
        "moduleTitle": "FREN / SÜSPANSİYON TESTİ",
        "statusOptions": [
          "İyi",
          "Orta",
          "Kötü"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "İyi",
            "label": "İyi",
            "displayLabel": "İyi",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "İyi"
          },
          {
            "optionType": "label",
            "value": "Orta",
            "label": "Orta",
            "displayLabel": "Orta",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Orta"
          },
          {
            "optionType": "label",
            "value": "Kötü",
            "label": "Kötü",
            "displayLabel": "Kötü",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Kötü"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 3,
        "labeledOptionCount": 3,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 1
        }
      },
      {
        "order": 2,
        "itemNo": 2,
        "noktaId": "285",
        "itemId": "n285-servis-fren-verimliligi",
        "title": "Servis Fren Verimliliği",
        "moduleId": "fren-suspansiyon",
        "moduleTitle": "FREN / SÜSPANSİYON TESTİ",
        "statusOptions": [
          "İyi",
          "Orta",
          "Kötü"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "İyi",
            "label": "İyi",
            "displayLabel": "İyi",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "İyi"
          },
          {
            "optionType": "label",
            "value": "Orta",
            "label": "Orta",
            "displayLabel": "Orta",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Orta"
          },
          {
            "optionType": "label",
            "value": "Kötü",
            "label": "Kötü",
            "displayLabel": "Kötü",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Kötü"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 3,
        "labeledOptionCount": 3,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 1
        }
      },
      {
        "order": 3,
        "itemNo": 3,
        "noktaId": "292",
        "itemId": "n292-on-sag-sol-fren-degerleri",
        "title": "Ön Sağ-Sol Fren Değerleri",
        "moduleId": "fren-suspansiyon",
        "moduleTitle": "FREN / SÜSPANSİYON TESTİ",
        "statusOptions": [
          "Uygun",
          "Fren Bakımı Gerekli"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "Uygun",
            "label": "Uygun",
            "displayLabel": "Uygun",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Uygun"
          },
          {
            "optionType": "label",
            "value": "Fren Bakımı Gerekli",
            "label": "Fren Bakımı Gerekli",
            "displayLabel": "Fren Bakımı Gerekli",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Fren Bakımı Gerekli"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 2,
        "labeledOptionCount": 2,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 1
        }
      },
      {
        "order": 4,
        "itemNo": 4,
        "noktaId": "293",
        "itemId": "n293-arka-sag-sol-fren-degerleri",
        "title": "Arka Sağ-Sol Fren Değerleri",
        "moduleId": "fren-suspansiyon",
        "moduleTitle": "FREN / SÜSPANSİYON TESTİ",
        "statusOptions": [
          "Uygun",
          "Fren Bakımı Gerekli"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "Uygun",
            "label": "Uygun",
            "displayLabel": "Uygun",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Uygun"
          },
          {
            "optionType": "label",
            "value": "Fren Bakımı Gerekli",
            "label": "Fren Bakımı Gerekli",
            "displayLabel": "Fren Bakımı Gerekli",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Fren Bakımı Gerekli"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 2,
        "labeledOptionCount": 2,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 1
        }
      },
      {
        "order": 5,
        "itemNo": 5,
        "noktaId": "289",
        "itemId": "n289-sag-on-suspansiyon",
        "title": "Sağ Ön Süspansiyon",
        "moduleId": "fren-suspansiyon",
        "moduleTitle": "FREN / SÜSPANSİYON TESTİ",
        "statusOptions": [
          "İyi",
          "Orta",
          "Kötü"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "İyi",
            "label": "İyi",
            "displayLabel": "İyi",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "İyi"
          },
          {
            "optionType": "label",
            "value": "Orta",
            "label": "Orta",
            "displayLabel": "Orta",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Orta"
          },
          {
            "optionType": "label",
            "value": "Kötü",
            "label": "Kötü",
            "displayLabel": "Kötü",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Kötü"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 3,
        "labeledOptionCount": 3,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 1
        }
      },
      {
        "order": 6,
        "itemNo": 6,
        "noktaId": "288",
        "itemId": "n288-sol-on-suspansiyon",
        "title": "Sol Ön Süspansiyon",
        "moduleId": "fren-suspansiyon",
        "moduleTitle": "FREN / SÜSPANSİYON TESTİ",
        "statusOptions": [
          "İyi",
          "Orta",
          "Kötü"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "İyi",
            "label": "İyi",
            "displayLabel": "İyi",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "İyi"
          },
          {
            "optionType": "label",
            "value": "Orta",
            "label": "Orta",
            "displayLabel": "Orta",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Orta"
          },
          {
            "optionType": "label",
            "value": "Kötü",
            "label": "Kötü",
            "displayLabel": "Kötü",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Kötü"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 3,
        "labeledOptionCount": 3,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 1
        }
      },
      {
        "order": 7,
        "itemNo": 7,
        "noktaId": "290",
        "itemId": "n290-sag-arka-suspansiyon",
        "title": "Sağ Arka Süspansiyon",
        "moduleId": "fren-suspansiyon",
        "moduleTitle": "FREN / SÜSPANSİYON TESTİ",
        "statusOptions": [
          "İyi",
          "Orta",
          "Kötü"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "İyi",
            "label": "İyi",
            "displayLabel": "İyi",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "İyi"
          },
          {
            "optionType": "label",
            "value": "Orta",
            "label": "Orta",
            "displayLabel": "Orta",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Orta"
          },
          {
            "optionType": "label",
            "value": "Kötü",
            "label": "Kötü",
            "displayLabel": "Kötü",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Kötü"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 3,
        "labeledOptionCount": 3,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 1
        }
      },
      {
        "order": 8,
        "itemNo": 8,
        "noktaId": "291",
        "itemId": "n291-sol-arka-suspansiyon",
        "title": "Sol Arka Süspansiyon",
        "moduleId": "fren-suspansiyon",
        "moduleTitle": "FREN / SÜSPANSİYON TESTİ",
        "statusOptions": [
          "İyi",
          "Orta",
          "Kötü"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "İyi",
            "label": "İyi",
            "displayLabel": "İyi",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "İyi"
          },
          {
            "optionType": "label",
            "value": "Orta",
            "label": "Orta",
            "displayLabel": "Orta",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Orta"
          },
          {
            "optionType": "label",
            "value": "Kötü",
            "label": "Kötü",
            "displayLabel": "Kötü",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Kötü"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 3,
        "labeledOptionCount": 3,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 1
        }
      },
      {
        "order": 9,
        "itemNo": 9,
        "noktaId": "306",
        "itemId": "n306-araca-ait-anlik-fren-suspansiyon-test-ciktisi",
        "title": "Araca Ait Anlık Fren/Süspansiyon Test Çıktısı",
        "moduleId": "fren-suspansiyon",
        "moduleTitle": "FREN / SÜSPANSİYON TESTİ",
        "statusOptions": [
          "Fren/Süspansiyon Test Çıktı Görseli"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "Fren/Süspansiyon Test Çıktı Görseli",
            "label": "Fren/Süspansiyon Test Çıktı Görseli",
            "displayLabel": "Fren/Süspansiyon Test Çıktı Görseli",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Fren/Süspansiyon Test Çıktı Görseli"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 1,
        "labeledOptionCount": 1,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": false,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 0
        }
      }
    ]
  },
  {
    "moduleNo": 4,
    "moduleId": "kaporta-boya",
    "key": "kaporta-boya",
    "title": "KAPORTA - BOYA EKSPERTİZ VE CHECK-UP",
    "shortTitle": "Kaporta / Boya",
    "groupTitle": "KAPORTA - BOYA EKSPERTİZ VE CHECK-UP",
    "groupTitles": [
      "KAPORTA - BOYA EKSPERTİZ VE CHECK-UP"
    ],
    "itemCount": 59,
    "items": [
      {
        "order": 1,
        "itemNo": 1,
        "noktaId": "1229",
        "itemId": "n1229-on-panjur",
        "title": "Ön Panjur",
        "moduleId": "kaporta-boya",
        "moduleTitle": "KAPORTA - BOYA EKSPERTİZ VE CHECK-UP",
        "statusOptions": [
          "Hasarlı",
          "Sorunsuz",
          "Deforme"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "Hasarlı",
            "label": "Hasarlı",
            "displayLabel": "Hasarlı",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Hasarlı"
          },
          {
            "optionType": "label",
            "value": "Sorunsuz",
            "label": "Sorunsuz",
            "displayLabel": "Sorunsuz",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Sorunsuz"
          },
          {
            "optionType": "label",
            "value": "Deforme",
            "label": "Deforme",
            "displayLabel": "Deforme",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Deforme"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 3,
        "labeledOptionCount": 3,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 2
        }
      },
      {
        "order": 2,
        "itemNo": 2,
        "noktaId": "962",
        "itemId": "n962-tavanda-gocuk-mevcut-mu",
        "title": "Tavanda Göçük Mevcut mu?",
        "moduleId": "kaporta-boya",
        "moduleTitle": "KAPORTA - BOYA EKSPERTİZ VE CHECK-UP",
        "statusOptions": [
          "Evet",
          "Hayır"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "Evet",
            "label": "Evet",
            "displayLabel": "Evet",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Evet"
          },
          {
            "optionType": "label",
            "value": "Hayır",
            "label": "Hayır",
            "displayLabel": "Hayır",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Hayır"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 2,
        "labeledOptionCount": 2,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 1
        }
      },
      {
        "order": 3,
        "itemNo": 3,
        "noktaId": "311",
        "itemId": "n311-aracta-noktasal-ezik-cizik-mevcut-mu-fotograf",
        "title": "Araçta Noktasal Ezik-Çizik Mevcut mu? Fotoğraf",
        "moduleId": "kaporta-boya",
        "moduleTitle": "KAPORTA - BOYA EKSPERTİZ VE CHECK-UP",
        "statusOptions": [],
        "options": [
          {
            "optionType": "checkbox",
            "value": "1557",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1557"
          },
          {
            "optionType": "checkbox",
            "value": "1558",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1558"
          },
          {
            "optionType": "checkbox",
            "value": "4296",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=4296"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 3,
        "labeledOptionCount": 0,
        "placeholderOptionCount": 3,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": true,
          "criticalOptionCountHeuristic": 0
        }
      },
      {
        "order": 4,
        "itemNo": 4,
        "noktaId": "11",
        "itemId": "n11-on-tampon",
        "title": "Ön Tampon",
        "moduleId": "kaporta-boya",
        "moduleTitle": "KAPORTA - BOYA EKSPERTİZ VE CHECK-UP",
        "statusOptions": [],
        "options": [
          {
            "optionType": "checkbox",
            "value": "20",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=20"
          },
          {
            "optionType": "checkbox",
            "value": "1343",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1343"
          },
          {
            "optionType": "checkbox",
            "value": "1345",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1345"
          },
          {
            "optionType": "checkbox",
            "value": "594",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=594"
          },
          {
            "optionType": "checkbox",
            "value": "564",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=564"
          },
          {
            "optionType": "checkbox",
            "value": "534",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=534"
          },
          {
            "optionType": "checkbox",
            "value": "504",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=504"
          },
          {
            "optionType": "checkbox",
            "value": "474",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=474"
          },
          {
            "optionType": "checkbox",
            "value": "444",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=444"
          },
          {
            "optionType": "checkbox",
            "value": "414",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=414"
          },
          {
            "optionType": "checkbox",
            "value": "1344",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1344"
          },
          {
            "optionType": "checkbox",
            "value": "310",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=310"
          },
          {
            "optionType": "checkbox",
            "value": "284",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=284"
          },
          {
            "optionType": "checkbox",
            "value": "258",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=258"
          },
          {
            "optionType": "checkbox",
            "value": "232",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=232"
          },
          {
            "optionType": "checkbox",
            "value": "206",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=206"
          },
          {
            "optionType": "checkbox",
            "value": "180",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=180"
          },
          {
            "optionType": "checkbox",
            "value": "49",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=49"
          },
          {
            "optionType": "checkbox",
            "value": "142",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=142"
          },
          {
            "optionType": "checkbox",
            "value": "114",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=114"
          },
          {
            "optionType": "checkbox",
            "value": "86",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=86"
          },
          {
            "optionType": "checkbox",
            "value": "58",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=58"
          },
          {
            "optionType": "checkbox",
            "value": "1346",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1346"
          },
          {
            "optionType": "checkbox",
            "value": "781",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=781"
          },
          {
            "optionType": "checkbox",
            "value": "764",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=764"
          },
          {
            "optionType": "checkbox",
            "value": "747",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=747"
          },
          {
            "optionType": "checkbox",
            "value": "713",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=713"
          },
          {
            "optionType": "checkbox",
            "value": "696",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=696"
          },
          {
            "optionType": "checkbox",
            "value": "679",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=679"
          },
          {
            "optionType": "checkbox",
            "value": "1517",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1517"
          },
          {
            "optionType": "checkbox",
            "value": "833",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=833"
          },
          {
            "optionType": "checkbox",
            "value": "816",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=816"
          },
          {
            "optionType": "checkbox",
            "value": "799",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=799"
          },
          {
            "optionType": "checkbox",
            "value": "1518",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1518"
          },
          {
            "optionType": "checkbox",
            "value": "891",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=891"
          },
          {
            "optionType": "checkbox",
            "value": "877",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=877"
          },
          {
            "optionType": "checkbox",
            "value": "863",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=863"
          },
          {
            "optionType": "checkbox",
            "value": "849",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=849"
          },
          {
            "optionType": "checkbox",
            "value": "2735",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=2735"
          },
          {
            "optionType": "checkbox",
            "value": "4330",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=4330"
          },
          {
            "optionType": "checkbox",
            "value": "7251",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=7251"
          },
          {
            "optionType": "checkbox",
            "value": "8611",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=8611"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 42,
        "labeledOptionCount": 0,
        "placeholderOptionCount": 42,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": true,
          "criticalOptionCountHeuristic": 0
        }
      },
      {
        "order": 5,
        "itemNo": 5,
        "noktaId": "23",
        "itemId": "n23-arka-tampon",
        "title": "Arka Tampon",
        "moduleId": "kaporta-boya",
        "moduleTitle": "KAPORTA - BOYA EKSPERTİZ VE CHECK-UP",
        "statusOptions": [],
        "options": [
          {
            "optionType": "checkbox",
            "value": "32",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=32"
          },
          {
            "optionType": "checkbox",
            "value": "1414",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1414"
          },
          {
            "optionType": "checkbox",
            "value": "641",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=641"
          },
          {
            "optionType": "checkbox",
            "value": "1297",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1297"
          },
          {
            "optionType": "checkbox",
            "value": "300",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=300"
          },
          {
            "optionType": "checkbox",
            "value": "274",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=274"
          },
          {
            "optionType": "checkbox",
            "value": "248",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=248"
          },
          {
            "optionType": "checkbox",
            "value": "222",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=222"
          },
          {
            "optionType": "checkbox",
            "value": "196",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=196"
          },
          {
            "optionType": "checkbox",
            "value": "170",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=170"
          },
          {
            "optionType": "checkbox",
            "value": "61",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=61"
          },
          {
            "optionType": "checkbox",
            "value": "154",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=154"
          },
          {
            "optionType": "checkbox",
            "value": "126",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=126"
          },
          {
            "optionType": "checkbox",
            "value": "98",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=98"
          },
          {
            "optionType": "checkbox",
            "value": "70",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=70"
          },
          {
            "optionType": "checkbox",
            "value": "1296",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1296"
          },
          {
            "optionType": "checkbox",
            "value": "583",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=583"
          },
          {
            "optionType": "checkbox",
            "value": "553",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=553"
          },
          {
            "optionType": "checkbox",
            "value": "523",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=523"
          },
          {
            "optionType": "checkbox",
            "value": "493",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=493"
          },
          {
            "optionType": "checkbox",
            "value": "463",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=463"
          },
          {
            "optionType": "checkbox",
            "value": "433",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=433"
          },
          {
            "optionType": "checkbox",
            "value": "403",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=403"
          },
          {
            "optionType": "checkbox",
            "value": "1507",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1507"
          },
          {
            "optionType": "checkbox",
            "value": "828",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=828"
          },
          {
            "optionType": "checkbox",
            "value": "811",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=811"
          },
          {
            "optionType": "checkbox",
            "value": "794",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=794"
          },
          {
            "optionType": "checkbox",
            "value": "1508",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1508"
          },
          {
            "optionType": "checkbox",
            "value": "886",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=886"
          },
          {
            "optionType": "checkbox",
            "value": "872",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=872"
          },
          {
            "optionType": "checkbox",
            "value": "858",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=858"
          },
          {
            "optionType": "checkbox",
            "value": "844",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=844"
          },
          {
            "optionType": "checkbox",
            "value": "2734",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=2734"
          },
          {
            "optionType": "checkbox",
            "value": "1298",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1298"
          },
          {
            "optionType": "checkbox",
            "value": "776",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=776"
          },
          {
            "optionType": "checkbox",
            "value": "759",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=759"
          },
          {
            "optionType": "checkbox",
            "value": "742",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=742"
          },
          {
            "optionType": "checkbox",
            "value": "708",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=708"
          },
          {
            "optionType": "checkbox",
            "value": "691",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=691"
          },
          {
            "optionType": "checkbox",
            "value": "674",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=674"
          },
          {
            "optionType": "checkbox",
            "value": "4331",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=4331"
          },
          {
            "optionType": "checkbox",
            "value": "7258",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=7258"
          },
          {
            "optionType": "checkbox",
            "value": "8612",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=8612"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 43,
        "labeledOptionCount": 0,
        "placeholderOptionCount": 43,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": true,
          "criticalOptionCountHeuristic": 0
        }
      },
      {
        "order": 6,
        "itemNo": 6,
        "noktaId": "18",
        "itemId": "n18-tavan",
        "title": "Tavan",
        "moduleId": "kaporta-boya",
        "moduleTitle": "KAPORTA - BOYA EKSPERTİZ VE CHECK-UP",
        "statusOptions": [],
        "options": [
          {
            "optionType": "checkbox",
            "value": "27",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=27"
          },
          {
            "optionType": "checkbox",
            "value": "1740",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1740"
          },
          {
            "optionType": "checkbox",
            "value": "1355",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1355"
          },
          {
            "optionType": "checkbox",
            "value": "338",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=338"
          },
          {
            "optionType": "checkbox",
            "value": "312",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=312"
          },
          {
            "optionType": "checkbox",
            "value": "286",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=286"
          },
          {
            "optionType": "checkbox",
            "value": "260",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=260"
          },
          {
            "optionType": "checkbox",
            "value": "234",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=234"
          },
          {
            "optionType": "checkbox",
            "value": "208",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=208"
          },
          {
            "optionType": "checkbox",
            "value": "182",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=182"
          },
          {
            "optionType": "checkbox",
            "value": "56",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=56"
          },
          {
            "optionType": "checkbox",
            "value": "149",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=149"
          },
          {
            "optionType": "checkbox",
            "value": "121",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=121"
          },
          {
            "optionType": "checkbox",
            "value": "93",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=93"
          },
          {
            "optionType": "checkbox",
            "value": "65",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=65"
          },
          {
            "optionType": "checkbox",
            "value": "1359",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1359"
          },
          {
            "optionType": "checkbox",
            "value": "393",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=393"
          },
          {
            "optionType": "checkbox",
            "value": "383",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=383"
          },
          {
            "optionType": "checkbox",
            "value": "373",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=373"
          },
          {
            "optionType": "checkbox",
            "value": "363",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=363"
          },
          {
            "optionType": "checkbox",
            "value": "353",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=353"
          },
          {
            "optionType": "checkbox",
            "value": "1357",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1357"
          },
          {
            "optionType": "checkbox",
            "value": "597",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=597"
          },
          {
            "optionType": "checkbox",
            "value": "567",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=567"
          },
          {
            "optionType": "checkbox",
            "value": "537",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=537"
          },
          {
            "optionType": "checkbox",
            "value": "507",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=507"
          },
          {
            "optionType": "checkbox",
            "value": "477",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=477"
          },
          {
            "optionType": "checkbox",
            "value": "447",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=447"
          },
          {
            "optionType": "checkbox",
            "value": "417",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=417"
          },
          {
            "optionType": "checkbox",
            "value": "1358",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1358"
          },
          {
            "optionType": "checkbox",
            "value": "669",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=669"
          },
          {
            "optionType": "checkbox",
            "value": "660",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=660"
          },
          {
            "optionType": "checkbox",
            "value": "651",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=651"
          },
          {
            "optionType": "checkbox",
            "value": "1356",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1356"
          },
          {
            "optionType": "checkbox",
            "value": "783",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=783"
          },
          {
            "optionType": "checkbox",
            "value": "766",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=766"
          },
          {
            "optionType": "checkbox",
            "value": "749",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=749"
          },
          {
            "optionType": "checkbox",
            "value": "732",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=732"
          },
          {
            "optionType": "checkbox",
            "value": "715",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=715"
          },
          {
            "optionType": "checkbox",
            "value": "698",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=698"
          },
          {
            "optionType": "checkbox",
            "value": "681",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=681"
          },
          {
            "optionType": "checkbox",
            "value": "1521",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1521"
          },
          {
            "optionType": "checkbox",
            "value": "835",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=835"
          },
          {
            "optionType": "checkbox",
            "value": "818",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=818"
          },
          {
            "optionType": "checkbox",
            "value": "801",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=801"
          },
          {
            "optionType": "checkbox",
            "value": "1522",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1522"
          },
          {
            "optionType": "checkbox",
            "value": "893",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=893"
          },
          {
            "optionType": "checkbox",
            "value": "879",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=879"
          },
          {
            "optionType": "checkbox",
            "value": "865",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=865"
          },
          {
            "optionType": "checkbox",
            "value": "851",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=851"
          },
          {
            "optionType": "checkbox",
            "value": "1644",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1644"
          },
          {
            "optionType": "checkbox",
            "value": "1559",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1559"
          },
          {
            "optionType": "checkbox",
            "value": "4332",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=4332"
          },
          {
            "optionType": "checkbox",
            "value": "5413",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=5413"
          },
          {
            "optionType": "checkbox",
            "value": "5549",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=5549"
          }
        ],
        "inputs": [
          {
            "inputType": "text",
            "label": "Mikron",
            "name": "EkAlan",
            "sourceText": "text (Mikron) name=EkAlan"
          }
        ],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 55,
        "labeledOptionCount": 0,
        "placeholderOptionCount": 55,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": true,
          "criticalOptionCountHeuristic": 0
        }
      },
      {
        "order": 7,
        "itemNo": 7,
        "noktaId": "187",
        "itemId": "n187-tavan-tipi",
        "title": "Tavan Tipi",
        "moduleId": "kaporta-boya",
        "moduleTitle": "KAPORTA - BOYA EKSPERTİZ VE CHECK-UP",
        "statusOptions": [
          "Normal",
          "Cam",
          "Kumaş"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "Normal",
            "label": "Normal",
            "displayLabel": "Normal",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Normal"
          },
          {
            "optionType": "label",
            "value": "Cam",
            "label": "Cam",
            "displayLabel": "Cam",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Cam"
          },
          {
            "optionType": "label",
            "value": "Kumaş",
            "label": "Kumaş",
            "displayLabel": "Kumaş",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Kumaş"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 3,
        "labeledOptionCount": 3,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": false,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 0
        }
      },
      {
        "order": 8,
        "itemNo": 8,
        "noktaId": "15",
        "itemId": "n15-on-kaput",
        "title": "Ön Kaput",
        "moduleId": "kaporta-boya",
        "moduleTitle": "KAPORTA - BOYA EKSPERTİZ VE CHECK-UP",
        "statusOptions": [],
        "options": [
          {
            "optionType": "checkbox",
            "value": "24",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=24"
          },
          {
            "optionType": "checkbox",
            "value": "1741",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1741"
          },
          {
            "optionType": "checkbox",
            "value": "1347",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1347"
          },
          {
            "optionType": "checkbox",
            "value": "337",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=337"
          },
          {
            "optionType": "checkbox",
            "value": "311",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=311"
          },
          {
            "optionType": "checkbox",
            "value": "285",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=285"
          },
          {
            "optionType": "checkbox",
            "value": "259",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=259"
          },
          {
            "optionType": "checkbox",
            "value": "233",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=233"
          },
          {
            "optionType": "checkbox",
            "value": "207",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=207"
          },
          {
            "optionType": "checkbox",
            "value": "181",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=181"
          },
          {
            "optionType": "checkbox",
            "value": "1350",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1350"
          },
          {
            "optionType": "checkbox",
            "value": "392",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=392"
          },
          {
            "optionType": "checkbox",
            "value": "382",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=382"
          },
          {
            "optionType": "checkbox",
            "value": "372",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=372"
          },
          {
            "optionType": "checkbox",
            "value": "362",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=362"
          },
          {
            "optionType": "checkbox",
            "value": "352",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=352"
          },
          {
            "optionType": "checkbox",
            "value": "53",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=53"
          },
          {
            "optionType": "checkbox",
            "value": "146",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=146"
          },
          {
            "optionType": "checkbox",
            "value": "118",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=118"
          },
          {
            "optionType": "checkbox",
            "value": "90",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=90"
          },
          {
            "optionType": "checkbox",
            "value": "62",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=62"
          },
          {
            "optionType": "checkbox",
            "value": "1348",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1348"
          },
          {
            "optionType": "checkbox",
            "value": "595",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=595"
          },
          {
            "optionType": "checkbox",
            "value": "565",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=565"
          },
          {
            "optionType": "checkbox",
            "value": "535",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=535"
          },
          {
            "optionType": "checkbox",
            "value": "505",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=505"
          },
          {
            "optionType": "checkbox",
            "value": "475",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=475"
          },
          {
            "optionType": "checkbox",
            "value": "445",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=445"
          },
          {
            "optionType": "checkbox",
            "value": "415",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=415"
          },
          {
            "optionType": "checkbox",
            "value": "1349",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1349"
          },
          {
            "optionType": "checkbox",
            "value": "782",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=782"
          },
          {
            "optionType": "checkbox",
            "value": "765",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=765"
          },
          {
            "optionType": "checkbox",
            "value": "748",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=748"
          },
          {
            "optionType": "checkbox",
            "value": "731",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=731"
          },
          {
            "optionType": "checkbox",
            "value": "714",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=714"
          },
          {
            "optionType": "checkbox",
            "value": "697",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=697"
          },
          {
            "optionType": "checkbox",
            "value": "680",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=680"
          },
          {
            "optionType": "checkbox",
            "value": "1519",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1519"
          },
          {
            "optionType": "checkbox",
            "value": "834",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=834"
          },
          {
            "optionType": "checkbox",
            "value": "817",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=817"
          },
          {
            "optionType": "checkbox",
            "value": "800",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=800"
          },
          {
            "optionType": "checkbox",
            "value": "1520",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1520"
          },
          {
            "optionType": "checkbox",
            "value": "892",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=892"
          },
          {
            "optionType": "checkbox",
            "value": "878",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=878"
          },
          {
            "optionType": "checkbox",
            "value": "864",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=864"
          },
          {
            "optionType": "checkbox",
            "value": "850",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=850"
          },
          {
            "optionType": "checkbox",
            "value": "1736",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1736"
          },
          {
            "optionType": "checkbox",
            "value": "2048",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=2048"
          },
          {
            "optionType": "checkbox",
            "value": "4333",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=4333"
          },
          {
            "optionType": "checkbox",
            "value": "4753",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=4753"
          },
          {
            "optionType": "checkbox",
            "value": "4754",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=4754"
          },
          {
            "optionType": "checkbox",
            "value": "5414",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=5414"
          },
          {
            "optionType": "checkbox",
            "value": "7287",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=7287"
          }
        ],
        "inputs": [
          {
            "inputType": "text",
            "label": "Mikron",
            "name": "EkAlan",
            "sourceText": "text (Mikron) name=EkAlan"
          }
        ],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 53,
        "labeledOptionCount": 0,
        "placeholderOptionCount": 53,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": true,
          "criticalOptionCountHeuristic": 0
        }
      },
      {
        "order": 9,
        "itemNo": 9,
        "noktaId": "1",
        "itemId": "n1-sol-on-sasi",
        "title": "Sol Ön - Şasi",
        "moduleId": "kaporta-boya",
        "moduleTitle": "KAPORTA - BOYA EKSPERTİZ VE CHECK-UP",
        "statusOptions": [],
        "options": [
          {
            "optionType": "checkbox",
            "value": "12",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=12"
          },
          {
            "optionType": "checkbox",
            "value": "621",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=621"
          },
          {
            "optionType": "checkbox",
            "value": "1254",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1254"
          },
          {
            "optionType": "checkbox",
            "value": "319",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=319"
          },
          {
            "optionType": "checkbox",
            "value": "293",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=293"
          },
          {
            "optionType": "checkbox",
            "value": "267",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=267"
          },
          {
            "optionType": "checkbox",
            "value": "241",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=241"
          },
          {
            "optionType": "checkbox",
            "value": "215",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=215"
          },
          {
            "optionType": "checkbox",
            "value": "189",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=189"
          },
          {
            "optionType": "checkbox",
            "value": "163",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=163"
          },
          {
            "optionType": "checkbox",
            "value": "1252",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1252"
          },
          {
            "optionType": "checkbox",
            "value": "1253",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1253"
          },
          {
            "optionType": "checkbox",
            "value": "631",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=631"
          },
          {
            "optionType": "checkbox",
            "value": "618",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=618"
          },
          {
            "optionType": "checkbox",
            "value": "605",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=605"
          },
          {
            "optionType": "checkbox",
            "value": "1262",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1262"
          },
          {
            "optionType": "checkbox",
            "value": "576",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=576"
          },
          {
            "optionType": "checkbox",
            "value": "546",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=546"
          },
          {
            "optionType": "checkbox",
            "value": "516",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=516"
          },
          {
            "optionType": "checkbox",
            "value": "486",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=486"
          },
          {
            "optionType": "checkbox",
            "value": "456",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=456"
          },
          {
            "optionType": "checkbox",
            "value": "426",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=426"
          },
          {
            "optionType": "checkbox",
            "value": "396",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=396"
          },
          {
            "optionType": "checkbox",
            "value": "1640",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1640"
          },
          {
            "optionType": "checkbox",
            "value": "4334",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=4334"
          },
          {
            "optionType": "checkbox",
            "value": "4755",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=4755"
          },
          {
            "optionType": "checkbox",
            "value": "4759",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=4759"
          },
          {
            "optionType": "checkbox",
            "value": "5415",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=5415"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 28,
        "labeledOptionCount": 0,
        "placeholderOptionCount": 28,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": true,
          "criticalOptionCountHeuristic": 0
        }
      },
      {
        "order": 10,
        "itemNo": 10,
        "noktaId": "24",
        "itemId": "n24-sag-on-sasi",
        "title": "Sağ Ön - Şasi",
        "moduleId": "kaporta-boya",
        "moduleTitle": "KAPORTA - BOYA EKSPERTİZ VE CHECK-UP",
        "statusOptions": [],
        "options": [
          {
            "optionType": "checkbox",
            "value": "33",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=33"
          },
          {
            "optionType": "checkbox",
            "value": "642",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=642"
          },
          {
            "optionType": "checkbox",
            "value": "1338",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1338"
          },
          {
            "optionType": "checkbox",
            "value": "334",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=334"
          },
          {
            "optionType": "checkbox",
            "value": "308",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=308"
          },
          {
            "optionType": "checkbox",
            "value": "282",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=282"
          },
          {
            "optionType": "checkbox",
            "value": "256",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=256"
          },
          {
            "optionType": "checkbox",
            "value": "230",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=230"
          },
          {
            "optionType": "checkbox",
            "value": "204",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=204"
          },
          {
            "optionType": "checkbox",
            "value": "178",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=178"
          },
          {
            "optionType": "checkbox",
            "value": "1335",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1335"
          },
          {
            "optionType": "checkbox",
            "value": "1337",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1337"
          },
          {
            "optionType": "checkbox",
            "value": "592",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=592"
          },
          {
            "optionType": "checkbox",
            "value": "562",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=562"
          },
          {
            "optionType": "checkbox",
            "value": "532",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=532"
          },
          {
            "optionType": "checkbox",
            "value": "502",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=502"
          },
          {
            "optionType": "checkbox",
            "value": "472",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=472"
          },
          {
            "optionType": "checkbox",
            "value": "442",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=442"
          },
          {
            "optionType": "checkbox",
            "value": "412",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=412"
          },
          {
            "optionType": "checkbox",
            "value": "1641",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1641"
          },
          {
            "optionType": "checkbox",
            "value": "1336",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1336"
          },
          {
            "optionType": "checkbox",
            "value": "638",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=638"
          },
          {
            "optionType": "checkbox",
            "value": "625",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=625"
          },
          {
            "optionType": "checkbox",
            "value": "612",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=612"
          },
          {
            "optionType": "checkbox",
            "value": "4335",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=4335"
          },
          {
            "optionType": "checkbox",
            "value": "4756",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=4756"
          },
          {
            "optionType": "checkbox",
            "value": "4760",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=4760"
          },
          {
            "optionType": "checkbox",
            "value": "5416",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=5416"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 28,
        "labeledOptionCount": 0,
        "placeholderOptionCount": 28,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": true,
          "criticalOptionCountHeuristic": 0
        }
      },
      {
        "order": 11,
        "itemNo": 11,
        "noktaId": "2",
        "itemId": "n2-sol-on-podye-saci",
        "title": "Sol Ön - Podye Sacı",
        "moduleId": "kaporta-boya",
        "moduleTitle": "KAPORTA - BOYA EKSPERTİZ VE CHECK-UP",
        "statusOptions": [],
        "options": [
          {
            "optionType": "checkbox",
            "value": "13",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=13"
          },
          {
            "optionType": "checkbox",
            "value": "622",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=622"
          },
          {
            "optionType": "checkbox",
            "value": "1257",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1257"
          },
          {
            "optionType": "checkbox",
            "value": "320",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=320"
          },
          {
            "optionType": "checkbox",
            "value": "294",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=294"
          },
          {
            "optionType": "checkbox",
            "value": "268",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=268"
          },
          {
            "optionType": "checkbox",
            "value": "242",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=242"
          },
          {
            "optionType": "checkbox",
            "value": "216",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=216"
          },
          {
            "optionType": "checkbox",
            "value": "190",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=190"
          },
          {
            "optionType": "checkbox",
            "value": "164",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=164"
          },
          {
            "optionType": "checkbox",
            "value": "1256",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1256"
          },
          {
            "optionType": "checkbox",
            "value": "1263",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1263"
          },
          {
            "optionType": "checkbox",
            "value": "577",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=577"
          },
          {
            "optionType": "checkbox",
            "value": "547",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=547"
          },
          {
            "optionType": "checkbox",
            "value": "517",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=517"
          },
          {
            "optionType": "checkbox",
            "value": "487",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=487"
          },
          {
            "optionType": "checkbox",
            "value": "457",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=457"
          },
          {
            "optionType": "checkbox",
            "value": "427",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=427"
          },
          {
            "optionType": "checkbox",
            "value": "397",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=397"
          },
          {
            "optionType": "checkbox",
            "value": "1255",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1255"
          },
          {
            "optionType": "checkbox",
            "value": "2731",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=2731"
          },
          {
            "optionType": "checkbox",
            "value": "4336",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=4336"
          },
          {
            "optionType": "checkbox",
            "value": "4761",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=4761"
          },
          {
            "optionType": "checkbox",
            "value": "4763",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=4763"
          },
          {
            "optionType": "checkbox",
            "value": "5417",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=5417"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 25,
        "labeledOptionCount": 0,
        "placeholderOptionCount": 25,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": true,
          "criticalOptionCountHeuristic": 0
        }
      },
      {
        "order": 12,
        "itemNo": 12,
        "noktaId": "25",
        "itemId": "n25-sag-on-podye-saci",
        "title": "Sağ Ön - Podye Sacı",
        "moduleId": "kaporta-boya",
        "moduleTitle": "KAPORTA - BOYA EKSPERTİZ VE CHECK-UP",
        "statusOptions": [],
        "options": [
          {
            "optionType": "checkbox",
            "value": "34",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=34"
          },
          {
            "optionType": "checkbox",
            "value": "643",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=643"
          },
          {
            "optionType": "checkbox",
            "value": "1332",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1332"
          },
          {
            "optionType": "checkbox",
            "value": "333",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=333"
          },
          {
            "optionType": "checkbox",
            "value": "307",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=307"
          },
          {
            "optionType": "checkbox",
            "value": "281",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=281"
          },
          {
            "optionType": "checkbox",
            "value": "255",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=255"
          },
          {
            "optionType": "checkbox",
            "value": "229",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=229"
          },
          {
            "optionType": "checkbox",
            "value": "203",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=203"
          },
          {
            "optionType": "checkbox",
            "value": "177",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=177"
          },
          {
            "optionType": "checkbox",
            "value": "1333",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1333"
          },
          {
            "optionType": "checkbox",
            "value": "1334",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1334"
          },
          {
            "optionType": "checkbox",
            "value": "591",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=591"
          },
          {
            "optionType": "checkbox",
            "value": "561",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=561"
          },
          {
            "optionType": "checkbox",
            "value": "531",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=531"
          },
          {
            "optionType": "checkbox",
            "value": "501",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=501"
          },
          {
            "optionType": "checkbox",
            "value": "471",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=471"
          },
          {
            "optionType": "checkbox",
            "value": "441",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=441"
          },
          {
            "optionType": "checkbox",
            "value": "411",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=411"
          },
          {
            "optionType": "checkbox",
            "value": "1622",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1622"
          },
          {
            "optionType": "checkbox",
            "value": "4337",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=4337"
          },
          {
            "optionType": "checkbox",
            "value": "4762",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=4762"
          },
          {
            "optionType": "checkbox",
            "value": "4764",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=4764"
          },
          {
            "optionType": "checkbox",
            "value": "5418",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=5418"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 24,
        "labeledOptionCount": 0,
        "placeholderOptionCount": 24,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": true,
          "criticalOptionCountHeuristic": 0
        }
      },
      {
        "order": 13,
        "itemNo": 13,
        "noktaId": "5",
        "itemId": "n5-sol-on-kule",
        "title": "Sol Ön - Kule",
        "moduleId": "kaporta-boya",
        "moduleTitle": "KAPORTA - BOYA EKSPERTİZ VE CHECK-UP",
        "statusOptions": [],
        "options": [
          {
            "optionType": "checkbox",
            "value": "14",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=14"
          },
          {
            "optionType": "checkbox",
            "value": "623",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=623"
          },
          {
            "optionType": "checkbox",
            "value": "1259",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1259"
          },
          {
            "optionType": "checkbox",
            "value": "1260",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1260"
          },
          {
            "optionType": "checkbox",
            "value": "575",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=575"
          },
          {
            "optionType": "checkbox",
            "value": "545",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=545"
          },
          {
            "optionType": "checkbox",
            "value": "515",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=515"
          },
          {
            "optionType": "checkbox",
            "value": "485",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=485"
          },
          {
            "optionType": "checkbox",
            "value": "455",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=455"
          },
          {
            "optionType": "checkbox",
            "value": "425",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=425"
          },
          {
            "optionType": "checkbox",
            "value": "395",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=395"
          },
          {
            "optionType": "checkbox",
            "value": "1258",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1258"
          },
          {
            "optionType": "checkbox",
            "value": "1261",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1261"
          },
          {
            "optionType": "checkbox",
            "value": "632",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=632"
          },
          {
            "optionType": "checkbox",
            "value": "619",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=619"
          },
          {
            "optionType": "checkbox",
            "value": "606",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=606"
          },
          {
            "optionType": "checkbox",
            "value": "4338",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=4338"
          },
          {
            "optionType": "checkbox",
            "value": "4765",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=4765"
          },
          {
            "optionType": "checkbox",
            "value": "4768",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=4768"
          },
          {
            "optionType": "checkbox",
            "value": "4769",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=4769"
          },
          {
            "optionType": "checkbox",
            "value": "5419",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=5419"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 21,
        "labeledOptionCount": 0,
        "placeholderOptionCount": 21,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": true,
          "criticalOptionCountHeuristic": 0
        }
      },
      {
        "order": 14,
        "itemNo": 14,
        "noktaId": "26",
        "itemId": "n26-sag-on-kule",
        "title": "Sağ Ön - Kule",
        "moduleId": "kaporta-boya",
        "moduleTitle": "KAPORTA - BOYA EKSPERTİZ VE CHECK-UP",
        "statusOptions": [],
        "options": [
          {
            "optionType": "checkbox",
            "value": "35",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=35"
          },
          {
            "optionType": "checkbox",
            "value": "644",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=644"
          },
          {
            "optionType": "checkbox",
            "value": "1329",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1329"
          },
          {
            "optionType": "checkbox",
            "value": "1331",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1331"
          },
          {
            "optionType": "checkbox",
            "value": "590",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=590"
          },
          {
            "optionType": "checkbox",
            "value": "560",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=560"
          },
          {
            "optionType": "checkbox",
            "value": "530",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=530"
          },
          {
            "optionType": "checkbox",
            "value": "500",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=500"
          },
          {
            "optionType": "checkbox",
            "value": "470",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=470"
          },
          {
            "optionType": "checkbox",
            "value": "440",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=440"
          },
          {
            "optionType": "checkbox",
            "value": "410",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=410"
          },
          {
            "optionType": "checkbox",
            "value": "1330",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1330"
          },
          {
            "optionType": "checkbox",
            "value": "637",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=637"
          },
          {
            "optionType": "checkbox",
            "value": "624",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=624"
          },
          {
            "optionType": "checkbox",
            "value": "611",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=611"
          },
          {
            "optionType": "checkbox",
            "value": "4339",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=4339"
          },
          {
            "optionType": "checkbox",
            "value": "4766",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=4766"
          },
          {
            "optionType": "checkbox",
            "value": "4767",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=4767"
          },
          {
            "optionType": "checkbox",
            "value": "4770",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=4770"
          },
          {
            "optionType": "checkbox",
            "value": "5420",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=5420"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 20,
        "labeledOptionCount": 0,
        "placeholderOptionCount": 20,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": true,
          "criticalOptionCountHeuristic": 0
        }
      },
      {
        "order": 15,
        "itemNo": 15,
        "noktaId": "12",
        "itemId": "n12-on-panel",
        "title": "Ön Panel",
        "moduleId": "kaporta-boya",
        "moduleTitle": "KAPORTA - BOYA EKSPERTİZ VE CHECK-UP",
        "statusOptions": [],
        "options": [
          {
            "optionType": "checkbox",
            "value": "21",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=21"
          },
          {
            "optionType": "checkbox",
            "value": "630",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=630"
          },
          {
            "optionType": "checkbox",
            "value": "1340",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1340"
          },
          {
            "optionType": "checkbox",
            "value": "335",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=335"
          },
          {
            "optionType": "checkbox",
            "value": "309",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=309"
          },
          {
            "optionType": "checkbox",
            "value": "283",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=283"
          },
          {
            "optionType": "checkbox",
            "value": "257",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=257"
          },
          {
            "optionType": "checkbox",
            "value": "231",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=231"
          },
          {
            "optionType": "checkbox",
            "value": "205",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=205"
          },
          {
            "optionType": "checkbox",
            "value": "179",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=179"
          },
          {
            "optionType": "checkbox",
            "value": "1341",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1341"
          },
          {
            "optionType": "checkbox",
            "value": "1339",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1339"
          },
          {
            "optionType": "checkbox",
            "value": "593",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=593"
          },
          {
            "optionType": "checkbox",
            "value": "563",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=563"
          },
          {
            "optionType": "checkbox",
            "value": "533",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=533"
          },
          {
            "optionType": "checkbox",
            "value": "503",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=503"
          },
          {
            "optionType": "checkbox",
            "value": "473",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=473"
          },
          {
            "optionType": "checkbox",
            "value": "443",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=443"
          },
          {
            "optionType": "checkbox",
            "value": "413",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=413"
          },
          {
            "optionType": "checkbox",
            "value": "1623",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1623"
          },
          {
            "optionType": "checkbox",
            "value": "1342",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1342"
          },
          {
            "optionType": "checkbox",
            "value": "639",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=639"
          },
          {
            "optionType": "checkbox",
            "value": "626",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=626"
          },
          {
            "optionType": "checkbox",
            "value": "613",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=613"
          },
          {
            "optionType": "checkbox",
            "value": "2858",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=2858"
          },
          {
            "optionType": "checkbox",
            "value": "4340",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=4340"
          },
          {
            "optionType": "checkbox",
            "value": "5421",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=5421"
          },
          {
            "optionType": "checkbox",
            "value": "7493",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=7493"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 28,
        "labeledOptionCount": 0,
        "placeholderOptionCount": 28,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": true,
          "criticalOptionCountHeuristic": 0
        }
      },
      {
        "order": 16,
        "itemNo": 16,
        "noktaId": "275",
        "itemId": "n275-arka-sol-sasi",
        "title": "Arka Sol Şasi",
        "moduleId": "kaporta-boya",
        "moduleTitle": "KAPORTA - BOYA EKSPERTİZ VE CHECK-UP",
        "statusOptions": [],
        "options": [
          {
            "optionType": "checkbox",
            "value": "1374",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1374"
          },
          {
            "optionType": "checkbox",
            "value": "1373",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1373"
          },
          {
            "optionType": "checkbox",
            "value": "1375",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1375"
          },
          {
            "optionType": "checkbox",
            "value": "641",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=641"
          },
          {
            "optionType": "checkbox",
            "value": "628",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=628"
          },
          {
            "optionType": "checkbox",
            "value": "615",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=615"
          },
          {
            "optionType": "checkbox",
            "value": "1372",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1372"
          },
          {
            "optionType": "checkbox",
            "value": "2036",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=2036"
          },
          {
            "optionType": "checkbox",
            "value": "1639",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1639"
          },
          {
            "optionType": "checkbox",
            "value": "4771",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=4771"
          },
          {
            "optionType": "checkbox",
            "value": "4341",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=4341"
          },
          {
            "optionType": "checkbox",
            "value": "5422",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=5422"
          },
          {
            "optionType": "checkbox",
            "value": "5606",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=5606"
          },
          {
            "optionType": "checkbox",
            "value": "4774",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=4774"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 14,
        "labeledOptionCount": 0,
        "placeholderOptionCount": 14,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": true,
          "criticalOptionCountHeuristic": 0
        }
      },
      {
        "order": 17,
        "itemNo": 17,
        "noktaId": "274",
        "itemId": "n274-arka-sag-sasi",
        "title": "Arka Sağ Şasi",
        "moduleId": "kaporta-boya",
        "moduleTitle": "KAPORTA - BOYA EKSPERTİZ VE CHECK-UP",
        "statusOptions": [],
        "options": [
          {
            "optionType": "checkbox",
            "value": "1369",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1369"
          },
          {
            "optionType": "checkbox",
            "value": "1368",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1368"
          },
          {
            "optionType": "checkbox",
            "value": "1371",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1371"
          },
          {
            "optionType": "checkbox",
            "value": "1370",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1370"
          },
          {
            "optionType": "checkbox",
            "value": "640",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=640"
          },
          {
            "optionType": "checkbox",
            "value": "627",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=627"
          },
          {
            "optionType": "checkbox",
            "value": "614",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=614"
          },
          {
            "optionType": "checkbox",
            "value": "2037",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=2037"
          },
          {
            "optionType": "checkbox",
            "value": "1638",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1638"
          },
          {
            "optionType": "checkbox",
            "value": "4342",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=4342"
          },
          {
            "optionType": "checkbox",
            "value": "4772",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=4772"
          },
          {
            "optionType": "checkbox",
            "value": "5423",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=5423"
          },
          {
            "optionType": "checkbox",
            "value": "5607",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=5607"
          },
          {
            "optionType": "checkbox",
            "value": "4773",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=4773"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 14,
        "labeledOptionCount": 0,
        "placeholderOptionCount": 14,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": true,
          "criticalOptionCountHeuristic": 0
        }
      },
      {
        "order": 18,
        "itemNo": 18,
        "noktaId": "21",
        "itemId": "n21-arka-ic-panel",
        "title": "Arka - İç Panel",
        "moduleId": "kaporta-boya",
        "moduleTitle": "KAPORTA - BOYA EKSPERTİZ VE CHECK-UP",
        "statusOptions": [],
        "options": [
          {
            "optionType": "checkbox",
            "value": "30",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=30"
          },
          {
            "optionType": "checkbox",
            "value": "639",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=639"
          },
          {
            "optionType": "checkbox",
            "value": "1284",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1284"
          },
          {
            "optionType": "checkbox",
            "value": "325",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=325"
          },
          {
            "optionType": "checkbox",
            "value": "299",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=299"
          },
          {
            "optionType": "checkbox",
            "value": "273",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=273"
          },
          {
            "optionType": "checkbox",
            "value": "247",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=247"
          },
          {
            "optionType": "checkbox",
            "value": "221",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=221"
          },
          {
            "optionType": "checkbox",
            "value": "195",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=195"
          },
          {
            "optionType": "checkbox",
            "value": "169",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=169"
          },
          {
            "optionType": "checkbox",
            "value": "1285",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1285"
          },
          {
            "optionType": "checkbox",
            "value": "582",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=582"
          },
          {
            "optionType": "checkbox",
            "value": "552",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=552"
          },
          {
            "optionType": "checkbox",
            "value": "522",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=522"
          },
          {
            "optionType": "checkbox",
            "value": "492",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=492"
          },
          {
            "optionType": "checkbox",
            "value": "462",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=462"
          },
          {
            "optionType": "checkbox",
            "value": "432",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=432"
          },
          {
            "optionType": "checkbox",
            "value": "402",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=402"
          },
          {
            "optionType": "checkbox",
            "value": "1286",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1286"
          },
          {
            "optionType": "checkbox",
            "value": "634",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=634"
          },
          {
            "optionType": "checkbox",
            "value": "621",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=621"
          },
          {
            "optionType": "checkbox",
            "value": "608",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=608"
          },
          {
            "optionType": "checkbox",
            "value": "1505",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1505"
          },
          {
            "optionType": "checkbox",
            "value": "827",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=827"
          },
          {
            "optionType": "checkbox",
            "value": "810",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=810"
          },
          {
            "optionType": "checkbox",
            "value": "793",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=793"
          },
          {
            "optionType": "checkbox",
            "value": "1506",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1506"
          },
          {
            "optionType": "checkbox",
            "value": "885",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=885"
          },
          {
            "optionType": "checkbox",
            "value": "871",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=871"
          },
          {
            "optionType": "checkbox",
            "value": "857",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=857"
          },
          {
            "optionType": "checkbox",
            "value": "843",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=843"
          },
          {
            "optionType": "checkbox",
            "value": "1624",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1624"
          },
          {
            "optionType": "checkbox",
            "value": "4343",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=4343"
          },
          {
            "optionType": "checkbox",
            "value": "4775",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=4775"
          },
          {
            "optionType": "checkbox",
            "value": "5424",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=5424"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 35,
        "labeledOptionCount": 0,
        "placeholderOptionCount": 35,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": true,
          "criticalOptionCountHeuristic": 0
        }
      },
      {
        "order": 19,
        "itemNo": 19,
        "noktaId": "22",
        "itemId": "n22-arka-havuz-ici",
        "title": "Arka Havuz İçi",
        "moduleId": "kaporta-boya",
        "moduleTitle": "KAPORTA - BOYA EKSPERTİZ VE CHECK-UP",
        "statusOptions": [],
        "options": [
          {
            "optionType": "checkbox",
            "value": "31",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=31"
          },
          {
            "optionType": "checkbox",
            "value": "640",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=640"
          },
          {
            "optionType": "checkbox",
            "value": "1300",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1300"
          },
          {
            "optionType": "checkbox",
            "value": "327",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=327"
          },
          {
            "optionType": "checkbox",
            "value": "301",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=301"
          },
          {
            "optionType": "checkbox",
            "value": "275",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=275"
          },
          {
            "optionType": "checkbox",
            "value": "249",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=249"
          },
          {
            "optionType": "checkbox",
            "value": "223",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=223"
          },
          {
            "optionType": "checkbox",
            "value": "197",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=197"
          },
          {
            "optionType": "checkbox",
            "value": "171",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=171"
          },
          {
            "optionType": "checkbox",
            "value": "1299",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1299"
          },
          {
            "optionType": "checkbox",
            "value": "584",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=584"
          },
          {
            "optionType": "checkbox",
            "value": "554",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=554"
          },
          {
            "optionType": "checkbox",
            "value": "524",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=524"
          },
          {
            "optionType": "checkbox",
            "value": "494",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=494"
          },
          {
            "optionType": "checkbox",
            "value": "464",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=464"
          },
          {
            "optionType": "checkbox",
            "value": "434",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=434"
          },
          {
            "optionType": "checkbox",
            "value": "404",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=404"
          },
          {
            "optionType": "checkbox",
            "value": "1301",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1301"
          },
          {
            "optionType": "checkbox",
            "value": "635",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=635"
          },
          {
            "optionType": "checkbox",
            "value": "622",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=622"
          },
          {
            "optionType": "checkbox",
            "value": "609",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=609"
          },
          {
            "optionType": "checkbox",
            "value": "1637",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1637"
          },
          {
            "optionType": "checkbox",
            "value": "4344",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=4344"
          },
          {
            "optionType": "checkbox",
            "value": "4776",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=4776"
          },
          {
            "optionType": "checkbox",
            "value": "5425",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=5425"
          },
          {
            "optionType": "checkbox",
            "value": "5451",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=5451"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 27,
        "labeledOptionCount": 0,
        "placeholderOptionCount": 27,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": true,
          "criticalOptionCountHeuristic": 0
        }
      },
      {
        "order": 20,
        "itemNo": 20,
        "noktaId": "6",
        "itemId": "n6-sol-on-camurluk",
        "title": "Sol Ön - Çamurluk",
        "moduleId": "kaporta-boya",
        "moduleTitle": "KAPORTA - BOYA EKSPERTİZ VE CHECK-UP",
        "statusOptions": [],
        "options": [
          {
            "optionType": "checkbox",
            "value": "15",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=15"
          },
          {
            "optionType": "checkbox",
            "value": "1264",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1264"
          },
          {
            "optionType": "checkbox",
            "value": "1266",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1266"
          },
          {
            "optionType": "checkbox",
            "value": "321",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=321"
          },
          {
            "optionType": "checkbox",
            "value": "295",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=295"
          },
          {
            "optionType": "checkbox",
            "value": "269",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=269"
          },
          {
            "optionType": "checkbox",
            "value": "243",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=243"
          },
          {
            "optionType": "checkbox",
            "value": "217",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=217"
          },
          {
            "optionType": "checkbox",
            "value": "191",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=191"
          },
          {
            "optionType": "checkbox",
            "value": "165",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=165"
          },
          {
            "optionType": "checkbox",
            "value": "1292",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1292"
          },
          {
            "optionType": "checkbox",
            "value": "385",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=385"
          },
          {
            "optionType": "checkbox",
            "value": "375",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=375"
          },
          {
            "optionType": "checkbox",
            "value": "365",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=365"
          },
          {
            "optionType": "checkbox",
            "value": "355",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=355"
          },
          {
            "optionType": "checkbox",
            "value": "345",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=345"
          },
          {
            "optionType": "checkbox",
            "value": "44",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=44"
          },
          {
            "optionType": "checkbox",
            "value": "138",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=138"
          },
          {
            "optionType": "checkbox",
            "value": "110",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=110"
          },
          {
            "optionType": "checkbox",
            "value": "82",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=82"
          },
          {
            "optionType": "checkbox",
            "value": "54",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=54"
          },
          {
            "optionType": "checkbox",
            "value": "1265",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1265"
          },
          {
            "optionType": "checkbox",
            "value": "578",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=578"
          },
          {
            "optionType": "checkbox",
            "value": "548",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=548"
          },
          {
            "optionType": "checkbox",
            "value": "518",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=518"
          },
          {
            "optionType": "checkbox",
            "value": "488",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=488"
          },
          {
            "optionType": "checkbox",
            "value": "428",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=428"
          },
          {
            "optionType": "checkbox",
            "value": "398",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=398"
          },
          {
            "optionType": "checkbox",
            "value": "1497",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1497"
          },
          {
            "optionType": "checkbox",
            "value": "824",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=824"
          },
          {
            "optionType": "checkbox",
            "value": "807",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=807"
          },
          {
            "optionType": "checkbox",
            "value": "790",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=790"
          },
          {
            "optionType": "checkbox",
            "value": "1498",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1498"
          },
          {
            "optionType": "checkbox",
            "value": "1645",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1645"
          },
          {
            "optionType": "checkbox",
            "value": "1267",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1267"
          },
          {
            "optionType": "checkbox",
            "value": "662",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=662"
          },
          {
            "optionType": "checkbox",
            "value": "653",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=653"
          },
          {
            "optionType": "checkbox",
            "value": "644",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=644"
          },
          {
            "optionType": "checkbox",
            "value": "1289",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1289"
          },
          {
            "optionType": "checkbox",
            "value": "773",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=773"
          },
          {
            "optionType": "checkbox",
            "value": "756",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=756"
          },
          {
            "optionType": "checkbox",
            "value": "739",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=739"
          },
          {
            "optionType": "checkbox",
            "value": "722",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=722"
          },
          {
            "optionType": "checkbox",
            "value": "705",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=705"
          },
          {
            "optionType": "checkbox",
            "value": "688",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=688"
          },
          {
            "optionType": "checkbox",
            "value": "671",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=671"
          },
          {
            "optionType": "checkbox",
            "value": "5426",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=5426"
          },
          {
            "optionType": "checkbox",
            "value": "4345",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=4345"
          },
          {
            "optionType": "checkbox",
            "value": "2732",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=2732"
          },
          {
            "optionType": "checkbox",
            "value": "4790",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=4790"
          },
          {
            "optionType": "checkbox",
            "value": "4789",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=4789"
          }
        ],
        "inputs": [
          {
            "inputType": "text",
            "label": "Mikron",
            "name": "EkAlan",
            "sourceText": "text (Mikron) name=EkAlan"
          }
        ],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 51,
        "labeledOptionCount": 0,
        "placeholderOptionCount": 51,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": true,
          "criticalOptionCountHeuristic": 0
        }
      },
      {
        "order": 21,
        "itemNo": 21,
        "noktaId": "7",
        "itemId": "n7-sol-on-kapi",
        "title": "Sol Ön - Kapı",
        "moduleId": "kaporta-boya",
        "moduleTitle": "KAPORTA - BOYA EKSPERTİZ VE CHECK-UP",
        "statusOptions": [],
        "options": [
          {
            "optionType": "checkbox",
            "value": "16",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=16"
          },
          {
            "optionType": "checkbox",
            "value": "1742",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1742"
          },
          {
            "optionType": "checkbox",
            "value": "1269",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1269"
          },
          {
            "optionType": "checkbox",
            "value": "322",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=322"
          },
          {
            "optionType": "checkbox",
            "value": "296",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=296"
          },
          {
            "optionType": "checkbox",
            "value": "270",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=270"
          },
          {
            "optionType": "checkbox",
            "value": "244",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=244"
          },
          {
            "optionType": "checkbox",
            "value": "218",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=218"
          },
          {
            "optionType": "checkbox",
            "value": "192",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=192"
          },
          {
            "optionType": "checkbox",
            "value": "166",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=166"
          },
          {
            "optionType": "checkbox",
            "value": "1293",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1293"
          },
          {
            "optionType": "checkbox",
            "value": "386",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=386"
          },
          {
            "optionType": "checkbox",
            "value": "376",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=376"
          },
          {
            "optionType": "checkbox",
            "value": "366",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=366"
          },
          {
            "optionType": "checkbox",
            "value": "356",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=356"
          },
          {
            "optionType": "checkbox",
            "value": "346",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=346"
          },
          {
            "optionType": "checkbox",
            "value": "1268",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1268"
          },
          {
            "optionType": "checkbox",
            "value": "579",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=579"
          },
          {
            "optionType": "checkbox",
            "value": "549",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=549"
          },
          {
            "optionType": "checkbox",
            "value": "519",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=519"
          },
          {
            "optionType": "checkbox",
            "value": "489",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=489"
          },
          {
            "optionType": "checkbox",
            "value": "459",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=459"
          },
          {
            "optionType": "checkbox",
            "value": "429",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=429"
          },
          {
            "optionType": "checkbox",
            "value": "399",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=399"
          },
          {
            "optionType": "checkbox",
            "value": "45",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=45"
          },
          {
            "optionType": "checkbox",
            "value": "139",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=139"
          },
          {
            "optionType": "checkbox",
            "value": "111",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=111"
          },
          {
            "optionType": "checkbox",
            "value": "83",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=83"
          },
          {
            "optionType": "checkbox",
            "value": "55",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=55"
          },
          {
            "optionType": "checkbox",
            "value": "1499",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1499"
          },
          {
            "optionType": "checkbox",
            "value": "825",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=825"
          },
          {
            "optionType": "checkbox",
            "value": "808",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=808"
          },
          {
            "optionType": "checkbox",
            "value": "791",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=791"
          },
          {
            "optionType": "checkbox",
            "value": "1500",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1500"
          },
          {
            "optionType": "checkbox",
            "value": "883",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=883"
          },
          {
            "optionType": "checkbox",
            "value": "869",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=869"
          },
          {
            "optionType": "checkbox",
            "value": "855",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=855"
          },
          {
            "optionType": "checkbox",
            "value": "841",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=841"
          },
          {
            "optionType": "checkbox",
            "value": "1646",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1646"
          },
          {
            "optionType": "checkbox",
            "value": "1270",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1270"
          },
          {
            "optionType": "checkbox",
            "value": "663",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=663"
          },
          {
            "optionType": "checkbox",
            "value": "654",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=654"
          },
          {
            "optionType": "checkbox",
            "value": "645",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=645"
          },
          {
            "optionType": "checkbox",
            "value": "1290",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1290"
          },
          {
            "optionType": "checkbox",
            "value": "774",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=774"
          },
          {
            "optionType": "checkbox",
            "value": "757",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=757"
          },
          {
            "optionType": "checkbox",
            "value": "740",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=740"
          },
          {
            "optionType": "checkbox",
            "value": "723",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=723"
          },
          {
            "optionType": "checkbox",
            "value": "706",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=706"
          },
          {
            "optionType": "checkbox",
            "value": "689",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=689"
          },
          {
            "optionType": "checkbox",
            "value": "672",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=672"
          },
          {
            "optionType": "checkbox",
            "value": "2049",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=2049"
          },
          {
            "optionType": "checkbox",
            "value": "4346",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=4346"
          },
          {
            "optionType": "checkbox",
            "value": "4792",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=4792"
          },
          {
            "optionType": "checkbox",
            "value": "5427",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=5427"
          },
          {
            "optionType": "checkbox",
            "value": "4791",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=4791"
          }
        ],
        "inputs": [
          {
            "inputType": "text",
            "label": "Mikron",
            "name": "EkAlan",
            "sourceText": "text (Mikron) name=EkAlan"
          }
        ],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 56,
        "labeledOptionCount": 0,
        "placeholderOptionCount": 56,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": true,
          "criticalOptionCountHeuristic": 0
        }
      },
      {
        "order": 22,
        "itemNo": 22,
        "noktaId": "8",
        "itemId": "n8-sol-on-ic-direk",
        "title": "Sol Ön - İç Direk",
        "moduleId": "kaporta-boya",
        "moduleTitle": "KAPORTA - BOYA EKSPERTİZ VE CHECK-UP",
        "statusOptions": [],
        "options": [
          {
            "optionType": "checkbox",
            "value": "17",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=17"
          },
          {
            "optionType": "checkbox",
            "value": "626",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=626"
          },
          {
            "optionType": "checkbox",
            "value": "1272",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1272"
          },
          {
            "optionType": "checkbox",
            "value": "323",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=323"
          },
          {
            "optionType": "checkbox",
            "value": "297",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=297"
          },
          {
            "optionType": "checkbox",
            "value": "271",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=271"
          },
          {
            "optionType": "checkbox",
            "value": "245",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=245"
          },
          {
            "optionType": "checkbox",
            "value": "219",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=219"
          },
          {
            "optionType": "checkbox",
            "value": "193",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=193"
          },
          {
            "optionType": "checkbox",
            "value": "167",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=167"
          },
          {
            "optionType": "checkbox",
            "value": "1274",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1274"
          },
          {
            "optionType": "checkbox",
            "value": "1271",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1271"
          },
          {
            "optionType": "checkbox",
            "value": "580",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=580"
          },
          {
            "optionType": "checkbox",
            "value": "550",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=550"
          },
          {
            "optionType": "checkbox",
            "value": "520",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=520"
          },
          {
            "optionType": "checkbox",
            "value": "490",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=490"
          },
          {
            "optionType": "checkbox",
            "value": "460",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=460"
          },
          {
            "optionType": "checkbox",
            "value": "430",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=430"
          },
          {
            "optionType": "checkbox",
            "value": "400",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=400"
          },
          {
            "optionType": "checkbox",
            "value": "1273",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1273"
          },
          {
            "optionType": "checkbox",
            "value": "633",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=633"
          },
          {
            "optionType": "checkbox",
            "value": "620",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=620"
          },
          {
            "optionType": "checkbox",
            "value": "607",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=607"
          },
          {
            "optionType": "checkbox",
            "value": "1291",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1291"
          },
          {
            "optionType": "checkbox",
            "value": "775",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=775"
          },
          {
            "optionType": "checkbox",
            "value": "758",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=758"
          },
          {
            "optionType": "checkbox",
            "value": "741",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=741"
          },
          {
            "optionType": "checkbox",
            "value": "724",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=724"
          },
          {
            "optionType": "checkbox",
            "value": "707",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=707"
          },
          {
            "optionType": "checkbox",
            "value": "690",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=690"
          },
          {
            "optionType": "checkbox",
            "value": "673",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=673"
          },
          {
            "optionType": "checkbox",
            "value": "3032",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=3032"
          },
          {
            "optionType": "checkbox",
            "value": "4347",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=4347"
          },
          {
            "optionType": "checkbox",
            "value": "4781",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=4781"
          },
          {
            "optionType": "checkbox",
            "value": "4785",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=4785"
          },
          {
            "optionType": "checkbox",
            "value": "5428",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=5428"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 36,
        "labeledOptionCount": 0,
        "placeholderOptionCount": 36,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": true,
          "criticalOptionCountHeuristic": 0
        }
      },
      {
        "order": 23,
        "itemNo": 23,
        "noktaId": "470",
        "itemId": "n470-sol-orta-ic-direk",
        "title": "Sol Orta İç Direk",
        "moduleId": "kaporta-boya",
        "moduleTitle": "KAPORTA - BOYA EKSPERTİZ VE CHECK-UP",
        "statusOptions": [],
        "options": [
          {
            "optionType": "checkbox",
            "value": "2000",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=2000"
          },
          {
            "optionType": "checkbox",
            "value": "1998",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1998"
          },
          {
            "optionType": "checkbox",
            "value": "1999",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1999"
          },
          {
            "optionType": "checkbox",
            "value": "1997",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1997"
          },
          {
            "optionType": "checkbox",
            "value": "2740",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=2740"
          },
          {
            "optionType": "checkbox",
            "value": "2742",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=2742"
          },
          {
            "optionType": "checkbox",
            "value": "2743",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=2743"
          },
          {
            "optionType": "checkbox",
            "value": "2741",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=2741"
          },
          {
            "optionType": "checkbox",
            "value": "4348",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=4348"
          },
          {
            "optionType": "checkbox",
            "value": "4782",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=4782"
          },
          {
            "optionType": "checkbox",
            "value": "4786",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=4786"
          },
          {
            "optionType": "checkbox",
            "value": "5429",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=5429"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 12,
        "labeledOptionCount": 0,
        "placeholderOptionCount": 12,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": true,
          "criticalOptionCountHeuristic": 0
        }
      },
      {
        "order": 24,
        "itemNo": 24,
        "noktaId": "472",
        "itemId": "n472-sol-arka-kapi-ici",
        "title": "Sol Arka Kapı İçi",
        "moduleId": "kaporta-boya",
        "moduleTitle": "KAPORTA - BOYA EKSPERTİZ VE CHECK-UP",
        "statusOptions": [],
        "options": [
          {
            "optionType": "checkbox",
            "value": "1996",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1996"
          },
          {
            "optionType": "checkbox",
            "value": "1994",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1994"
          },
          {
            "optionType": "checkbox",
            "value": "1995",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1995"
          },
          {
            "optionType": "checkbox",
            "value": "1993",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1993"
          },
          {
            "optionType": "checkbox",
            "value": "2860",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=2860"
          },
          {
            "optionType": "checkbox",
            "value": "3033",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=3033"
          },
          {
            "optionType": "checkbox",
            "value": "3135",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=3135"
          },
          {
            "optionType": "checkbox",
            "value": "4349",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=4349"
          },
          {
            "optionType": "checkbox",
            "value": "4777",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=4777"
          },
          {
            "optionType": "checkbox",
            "value": "5430",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=5430"
          },
          {
            "optionType": "checkbox",
            "value": "5530",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=5530"
          },
          {
            "optionType": "checkbox",
            "value": "5531",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=5531"
          },
          {
            "optionType": "checkbox",
            "value": "9292",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=9292"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 13,
        "labeledOptionCount": 0,
        "placeholderOptionCount": 13,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": true,
          "criticalOptionCountHeuristic": 0
        }
      },
      {
        "order": 25,
        "itemNo": 25,
        "noktaId": "9",
        "itemId": "n9-sol-arka-kapi",
        "title": "Sol Arka - Kapı",
        "moduleId": "kaporta-boya",
        "moduleTitle": "KAPORTA - BOYA EKSPERTİZ VE CHECK-UP",
        "statusOptions": [],
        "options": [
          {
            "optionType": "checkbox",
            "value": "18",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=18"
          },
          {
            "optionType": "checkbox",
            "value": "1743",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1743"
          },
          {
            "optionType": "checkbox",
            "value": "1276",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1276"
          },
          {
            "optionType": "checkbox",
            "value": "324",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=324"
          },
          {
            "optionType": "checkbox",
            "value": "298",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=298"
          },
          {
            "optionType": "checkbox",
            "value": "272",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=272"
          },
          {
            "optionType": "checkbox",
            "value": "246",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=246"
          },
          {
            "optionType": "checkbox",
            "value": "220",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=220"
          },
          {
            "optionType": "checkbox",
            "value": "194",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=194"
          },
          {
            "optionType": "checkbox",
            "value": "168",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=168"
          },
          {
            "optionType": "checkbox",
            "value": "1294",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1294"
          },
          {
            "optionType": "checkbox",
            "value": "387",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=387"
          },
          {
            "optionType": "checkbox",
            "value": "377",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=377"
          },
          {
            "optionType": "checkbox",
            "value": "367",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=367"
          },
          {
            "optionType": "checkbox",
            "value": "357",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=357"
          },
          {
            "optionType": "checkbox",
            "value": "347",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=347"
          },
          {
            "optionType": "checkbox",
            "value": "1277",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1277"
          },
          {
            "optionType": "checkbox",
            "value": "581",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=581"
          },
          {
            "optionType": "checkbox",
            "value": "551",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=551"
          },
          {
            "optionType": "checkbox",
            "value": "521",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=521"
          },
          {
            "optionType": "checkbox",
            "value": "491",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=491"
          },
          {
            "optionType": "checkbox",
            "value": "461",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=461"
          },
          {
            "optionType": "checkbox",
            "value": "431",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=431"
          },
          {
            "optionType": "checkbox",
            "value": "401",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=401"
          },
          {
            "optionType": "checkbox",
            "value": "47",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=47"
          },
          {
            "optionType": "checkbox",
            "value": "141",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=141"
          },
          {
            "optionType": "checkbox",
            "value": "113",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=113"
          },
          {
            "optionType": "checkbox",
            "value": "85",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=85"
          },
          {
            "optionType": "checkbox",
            "value": "57",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=57"
          },
          {
            "optionType": "checkbox",
            "value": "1501",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1501"
          },
          {
            "optionType": "checkbox",
            "value": "826",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=826"
          },
          {
            "optionType": "checkbox",
            "value": "809",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=809"
          },
          {
            "optionType": "checkbox",
            "value": "792",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=792"
          },
          {
            "optionType": "checkbox",
            "value": "1502",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1502"
          },
          {
            "optionType": "checkbox",
            "value": "884",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=884"
          },
          {
            "optionType": "checkbox",
            "value": "870",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=870"
          },
          {
            "optionType": "checkbox",
            "value": "856",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=856"
          },
          {
            "optionType": "checkbox",
            "value": "842",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=842"
          },
          {
            "optionType": "checkbox",
            "value": "1647",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1647"
          },
          {
            "optionType": "checkbox",
            "value": "1279",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1279"
          },
          {
            "optionType": "checkbox",
            "value": "664",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=664"
          },
          {
            "optionType": "checkbox",
            "value": "655",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=655"
          },
          {
            "optionType": "checkbox",
            "value": "646",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=646"
          },
          {
            "optionType": "checkbox",
            "value": "1488",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1488"
          },
          {
            "optionType": "checkbox",
            "value": "787",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=787"
          },
          {
            "optionType": "checkbox",
            "value": "770",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=770"
          },
          {
            "optionType": "checkbox",
            "value": "753",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=753"
          },
          {
            "optionType": "checkbox",
            "value": "736",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=736"
          },
          {
            "optionType": "checkbox",
            "value": "719",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=719"
          },
          {
            "optionType": "checkbox",
            "value": "702",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=702"
          },
          {
            "optionType": "checkbox",
            "value": "685",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=685"
          },
          {
            "optionType": "checkbox",
            "value": "2050",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=2050"
          },
          {
            "optionType": "checkbox",
            "value": "4350",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=4350"
          },
          {
            "optionType": "checkbox",
            "value": "4794",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=4794"
          },
          {
            "optionType": "checkbox",
            "value": "5431",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=5431"
          },
          {
            "optionType": "checkbox",
            "value": "4793",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=4793"
          },
          {
            "optionType": "checkbox",
            "value": "1275",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1275"
          }
        ],
        "inputs": [
          {
            "inputType": "text",
            "label": "Mikron",
            "name": "EkAlan",
            "sourceText": "text (Mikron) name=EkAlan"
          }
        ],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 57,
        "labeledOptionCount": 0,
        "placeholderOptionCount": 57,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": true,
          "criticalOptionCountHeuristic": 0
        }
      },
      {
        "order": 26,
        "itemNo": 26,
        "noktaId": "10",
        "itemId": "n10-sol-arka-camurluk",
        "title": "Sol Arka - Çamurluk",
        "moduleId": "kaporta-boya",
        "moduleTitle": "KAPORTA - BOYA EKSPERTİZ VE CHECK-UP",
        "statusOptions": [],
        "options": [
          {
            "optionType": "checkbox",
            "value": "19",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=19"
          },
          {
            "optionType": "checkbox",
            "value": "1560",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1560"
          },
          {
            "optionType": "checkbox",
            "value": "1281",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1281"
          },
          {
            "optionType": "checkbox",
            "value": "898",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=898"
          },
          {
            "optionType": "checkbox",
            "value": "18",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=18"
          },
          {
            "optionType": "checkbox",
            "value": "17",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=17"
          },
          {
            "optionType": "checkbox",
            "value": "16",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=16"
          },
          {
            "optionType": "checkbox",
            "value": "15",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=15"
          },
          {
            "optionType": "checkbox",
            "value": "14",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=14"
          },
          {
            "optionType": "checkbox",
            "value": "13",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=13"
          },
          {
            "optionType": "checkbox",
            "value": "12",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=12"
          },
          {
            "optionType": "checkbox",
            "value": "1295",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1295"
          },
          {
            "optionType": "checkbox",
            "value": "23",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=23"
          },
          {
            "optionType": "checkbox",
            "value": "22",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=22"
          },
          {
            "optionType": "checkbox",
            "value": "21",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=21"
          },
          {
            "optionType": "checkbox",
            "value": "19",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=19"
          },
          {
            "optionType": "checkbox",
            "value": "48",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=48"
          },
          {
            "optionType": "checkbox",
            "value": "11",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=11"
          },
          {
            "optionType": "checkbox",
            "value": "10",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=10"
          },
          {
            "optionType": "checkbox",
            "value": "9",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=9"
          },
          {
            "optionType": "checkbox",
            "value": "8",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=8"
          },
          {
            "optionType": "checkbox",
            "value": "1280",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1280"
          },
          {
            "optionType": "checkbox",
            "value": "30",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=30"
          },
          {
            "optionType": "checkbox",
            "value": "29",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=29"
          },
          {
            "optionType": "checkbox",
            "value": "28",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=28"
          },
          {
            "optionType": "checkbox",
            "value": "27",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=27"
          },
          {
            "optionType": "checkbox",
            "value": "26",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=26"
          },
          {
            "optionType": "checkbox",
            "value": "25",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=25"
          },
          {
            "optionType": "checkbox",
            "value": "1503",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1503"
          },
          {
            "optionType": "checkbox",
            "value": "46",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=46"
          },
          {
            "optionType": "checkbox",
            "value": "45",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=45"
          },
          {
            "optionType": "checkbox",
            "value": "44",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=44"
          },
          {
            "optionType": "checkbox",
            "value": "1504",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1504"
          },
          {
            "optionType": "checkbox",
            "value": "50",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=50"
          },
          {
            "optionType": "checkbox",
            "value": "49",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=49"
          },
          {
            "optionType": "checkbox",
            "value": "48",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=48"
          },
          {
            "optionType": "checkbox",
            "value": "47",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=47"
          },
          {
            "optionType": "checkbox",
            "value": "1648",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1648"
          },
          {
            "optionType": "checkbox",
            "value": "1282",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1282"
          },
          {
            "optionType": "checkbox",
            "value": "36",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=36"
          },
          {
            "optionType": "checkbox",
            "value": "35",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=35"
          },
          {
            "optionType": "checkbox",
            "value": "34",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=34"
          },
          {
            "optionType": "checkbox",
            "value": "1413",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1413"
          },
          {
            "optionType": "checkbox",
            "value": "43",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=43"
          },
          {
            "optionType": "checkbox",
            "value": "42",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=42"
          },
          {
            "optionType": "checkbox",
            "value": "41",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=41"
          },
          {
            "optionType": "checkbox",
            "value": "40",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=40"
          },
          {
            "optionType": "checkbox",
            "value": "39",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=39"
          },
          {
            "optionType": "checkbox",
            "value": "38",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=38"
          },
          {
            "optionType": "checkbox",
            "value": "37",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=37"
          },
          {
            "optionType": "checkbox",
            "value": "5432",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=5432"
          },
          {
            "optionType": "checkbox",
            "value": "4351",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=4351"
          },
          {
            "optionType": "checkbox",
            "value": "1283",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1283"
          },
          {
            "optionType": "checkbox",
            "value": "33",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=33"
          },
          {
            "optionType": "checkbox",
            "value": "32",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=32"
          },
          {
            "optionType": "checkbox",
            "value": "31",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=31"
          },
          {
            "optionType": "checkbox",
            "value": "5601",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=5601"
          }
        ],
        "inputs": [
          {
            "inputType": "text",
            "label": "Mikron",
            "name": "EkAlan",
            "sourceText": "text (Mikron) name=EkAlan"
          }
        ],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 57,
        "labeledOptionCount": 0,
        "placeholderOptionCount": 57,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": true,
          "criticalOptionCountHeuristic": 0
        }
      },
      {
        "order": 27,
        "itemNo": 27,
        "noktaId": "31",
        "itemId": "n31-sag-arka-camurluk",
        "title": "Sağ Arka Çamurluk",
        "moduleId": "kaporta-boya",
        "moduleTitle": "KAPORTA - BOYA EKSPERTİZ VE CHECK-UP",
        "statusOptions": [],
        "options": [
          {
            "optionType": "checkbox",
            "value": "40",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=40"
          },
          {
            "optionType": "checkbox",
            "value": "1561",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1561"
          },
          {
            "optionType": "checkbox",
            "value": "1303",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1303"
          },
          {
            "optionType": "checkbox",
            "value": "897",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=897"
          },
          {
            "optionType": "checkbox",
            "value": "328",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=328"
          },
          {
            "optionType": "checkbox",
            "value": "302",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=302"
          },
          {
            "optionType": "checkbox",
            "value": "276",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=276"
          },
          {
            "optionType": "checkbox",
            "value": "250",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=250"
          },
          {
            "optionType": "checkbox",
            "value": "224",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=224"
          },
          {
            "optionType": "checkbox",
            "value": "198",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=198"
          },
          {
            "optionType": "checkbox",
            "value": "172",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=172"
          },
          {
            "optionType": "checkbox",
            "value": "1305",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1305"
          },
          {
            "optionType": "checkbox",
            "value": "388",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=388"
          },
          {
            "optionType": "checkbox",
            "value": "378",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=378"
          },
          {
            "optionType": "checkbox",
            "value": "368",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=368"
          },
          {
            "optionType": "checkbox",
            "value": "348",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=348"
          },
          {
            "optionType": "checkbox",
            "value": "69",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=69"
          },
          {
            "optionType": "checkbox",
            "value": "162",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=162"
          },
          {
            "optionType": "checkbox",
            "value": "134",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=134"
          },
          {
            "optionType": "checkbox",
            "value": "106",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=106"
          },
          {
            "optionType": "checkbox",
            "value": "78",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=78"
          },
          {
            "optionType": "checkbox",
            "value": "1302",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1302"
          },
          {
            "optionType": "checkbox",
            "value": "585",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=585"
          },
          {
            "optionType": "checkbox",
            "value": "555",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=555"
          },
          {
            "optionType": "checkbox",
            "value": "525",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=525"
          },
          {
            "optionType": "checkbox",
            "value": "495",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=495"
          },
          {
            "optionType": "checkbox",
            "value": "465",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=465"
          },
          {
            "optionType": "checkbox",
            "value": "435",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=435"
          },
          {
            "optionType": "checkbox",
            "value": "1509",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1509"
          },
          {
            "optionType": "checkbox",
            "value": "829",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=829"
          },
          {
            "optionType": "checkbox",
            "value": "812",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=812"
          },
          {
            "optionType": "checkbox",
            "value": "795",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=795"
          },
          {
            "optionType": "checkbox",
            "value": "1510",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1510"
          },
          {
            "optionType": "checkbox",
            "value": "887",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=887"
          },
          {
            "optionType": "checkbox",
            "value": "873",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=873"
          },
          {
            "optionType": "checkbox",
            "value": "859",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=859"
          },
          {
            "optionType": "checkbox",
            "value": "845",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=845"
          },
          {
            "optionType": "checkbox",
            "value": "1649",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1649"
          },
          {
            "optionType": "checkbox",
            "value": "1307",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1307"
          },
          {
            "optionType": "checkbox",
            "value": "665",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=665"
          },
          {
            "optionType": "checkbox",
            "value": "656",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=656"
          },
          {
            "optionType": "checkbox",
            "value": "647",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=647"
          },
          {
            "optionType": "checkbox",
            "value": "1304",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1304"
          },
          {
            "optionType": "checkbox",
            "value": "777",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=777"
          },
          {
            "optionType": "checkbox",
            "value": "760",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=760"
          },
          {
            "optionType": "checkbox",
            "value": "743",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=743"
          },
          {
            "optionType": "checkbox",
            "value": "726",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=726"
          },
          {
            "optionType": "checkbox",
            "value": "709",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=709"
          },
          {
            "optionType": "checkbox",
            "value": "692",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=692"
          },
          {
            "optionType": "checkbox",
            "value": "675",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=675"
          },
          {
            "optionType": "checkbox",
            "value": "5433",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=5433"
          },
          {
            "optionType": "checkbox",
            "value": "4352",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=4352"
          },
          {
            "optionType": "checkbox",
            "value": "1306",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1306"
          },
          {
            "optionType": "checkbox",
            "value": "636",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=636"
          },
          {
            "optionType": "checkbox",
            "value": "623",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=623"
          },
          {
            "optionType": "checkbox",
            "value": "610",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=610"
          },
          {
            "optionType": "checkbox",
            "value": "5602",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=5602"
          }
        ],
        "inputs": [
          {
            "inputType": "text",
            "label": "Mikron",
            "name": "EkAlan",
            "sourceText": "text (Mikron) name=EkAlan"
          }
        ],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 57,
        "labeledOptionCount": 0,
        "placeholderOptionCount": 57,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": true,
          "criticalOptionCountHeuristic": 0
        }
      },
      {
        "order": 28,
        "itemNo": 28,
        "noktaId": "29",
        "itemId": "n29-sag-on-ic-direk",
        "title": "Sağ Ön İç Direk",
        "moduleId": "kaporta-boya",
        "moduleTitle": "KAPORTA - BOYA EKSPERTİZ VE CHECK-UP",
        "statusOptions": [],
        "options": [
          {
            "optionType": "checkbox",
            "value": "38",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=38"
          },
          {
            "optionType": "checkbox",
            "value": "647",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=647"
          },
          {
            "optionType": "checkbox",
            "value": "1313",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1313"
          },
          {
            "optionType": "checkbox",
            "value": "330",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=330"
          },
          {
            "optionType": "checkbox",
            "value": "304",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=304"
          },
          {
            "optionType": "checkbox",
            "value": "278",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=278"
          },
          {
            "optionType": "checkbox",
            "value": "252",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=252"
          },
          {
            "optionType": "checkbox",
            "value": "226",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=226"
          },
          {
            "optionType": "checkbox",
            "value": "200",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=200"
          },
          {
            "optionType": "checkbox",
            "value": "174",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=174"
          },
          {
            "optionType": "checkbox",
            "value": "1315",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1315"
          },
          {
            "optionType": "checkbox",
            "value": "1314",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1314"
          },
          {
            "optionType": "checkbox",
            "value": "587",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=587"
          },
          {
            "optionType": "checkbox",
            "value": "557",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=557"
          },
          {
            "optionType": "checkbox",
            "value": "527",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=527"
          },
          {
            "optionType": "checkbox",
            "value": "497",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=497"
          },
          {
            "optionType": "checkbox",
            "value": "467",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=467"
          },
          {
            "optionType": "checkbox",
            "value": "437",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=437"
          },
          {
            "optionType": "checkbox",
            "value": "407",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=407"
          },
          {
            "optionType": "checkbox",
            "value": "3034",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=3034"
          },
          {
            "optionType": "checkbox",
            "value": "4936",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=4936"
          },
          {
            "optionType": "checkbox",
            "value": "5434",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=5434"
          },
          {
            "optionType": "checkbox",
            "value": "5464",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=5464"
          },
          {
            "optionType": "checkbox",
            "value": "4353",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=4353"
          },
          {
            "optionType": "checkbox",
            "value": "4783",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=4783"
          },
          {
            "optionType": "checkbox",
            "value": "4787",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=4787"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 26,
        "labeledOptionCount": 0,
        "placeholderOptionCount": 26,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": true,
          "criticalOptionCountHeuristic": 0
        }
      },
      {
        "order": 29,
        "itemNo": 29,
        "noktaId": "692",
        "itemId": "n692-kapi-fitil-lastikleri-ve-kapi-gergileri",
        "title": "Kapı Fitil Lastikleri ve Kapı Gergileri",
        "moduleId": "kaporta-boya",
        "moduleTitle": "KAPORTA - BOYA EKSPERTİZ VE CHECK-UP",
        "statusOptions": [],
        "options": [
          {
            "optionType": "checkbox",
            "value": "3050",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=3050"
          },
          {
            "optionType": "checkbox",
            "value": "3051",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=3051"
          },
          {
            "optionType": "checkbox",
            "value": "3052",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=3052"
          },
          {
            "optionType": "checkbox",
            "value": "3054",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=3054"
          },
          {
            "optionType": "checkbox",
            "value": "3055",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=3055"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 5,
        "labeledOptionCount": 0,
        "placeholderOptionCount": 5,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": true,
          "criticalOptionCountHeuristic": 0
        }
      },
      {
        "order": 30,
        "itemNo": 30,
        "noktaId": "30",
        "itemId": "n30-sag-arka-kapi",
        "title": "Sağ Arka - Kapı",
        "moduleId": "kaporta-boya",
        "moduleTitle": "KAPORTA - BOYA EKSPERTİZ VE CHECK-UP",
        "statusOptions": [],
        "options": [
          {
            "optionType": "checkbox",
            "value": "39",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=39"
          },
          {
            "optionType": "checkbox",
            "value": "5446",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=5446"
          },
          {
            "optionType": "checkbox",
            "value": "1309",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1309"
          },
          {
            "optionType": "checkbox",
            "value": "329",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=329"
          },
          {
            "optionType": "checkbox",
            "value": "303",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=303"
          },
          {
            "optionType": "checkbox",
            "value": "277",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=277"
          },
          {
            "optionType": "checkbox",
            "value": "251",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=251"
          },
          {
            "optionType": "checkbox",
            "value": "225",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=225"
          },
          {
            "optionType": "checkbox",
            "value": "199",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=199"
          },
          {
            "optionType": "checkbox",
            "value": "173",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=173"
          },
          {
            "optionType": "checkbox",
            "value": "1312",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1312"
          },
          {
            "optionType": "checkbox",
            "value": "389",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=389"
          },
          {
            "optionType": "checkbox",
            "value": "379",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=379"
          },
          {
            "optionType": "checkbox",
            "value": "369",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=369"
          },
          {
            "optionType": "checkbox",
            "value": "359",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=359"
          },
          {
            "optionType": "checkbox",
            "value": "349",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=349"
          },
          {
            "optionType": "checkbox",
            "value": "1308",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1308"
          },
          {
            "optionType": "checkbox",
            "value": "586",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=586"
          },
          {
            "optionType": "checkbox",
            "value": "556",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=556"
          },
          {
            "optionType": "checkbox",
            "value": "526",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=526"
          },
          {
            "optionType": "checkbox",
            "value": "496",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=496"
          },
          {
            "optionType": "checkbox",
            "value": "466",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=466"
          },
          {
            "optionType": "checkbox",
            "value": "436",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=436"
          },
          {
            "optionType": "checkbox",
            "value": "406",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=406"
          },
          {
            "optionType": "checkbox",
            "value": "68",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=68"
          },
          {
            "optionType": "checkbox",
            "value": "161",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=161"
          },
          {
            "optionType": "checkbox",
            "value": "133",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=133"
          },
          {
            "optionType": "checkbox",
            "value": "105",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=105"
          },
          {
            "optionType": "checkbox",
            "value": "77",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=77"
          },
          {
            "optionType": "checkbox",
            "value": "1511",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1511"
          },
          {
            "optionType": "checkbox",
            "value": "830",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=830"
          },
          {
            "optionType": "checkbox",
            "value": "813",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=813"
          },
          {
            "optionType": "checkbox",
            "value": "796",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=796"
          },
          {
            "optionType": "checkbox",
            "value": "1512",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1512"
          },
          {
            "optionType": "checkbox",
            "value": "888",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=888"
          },
          {
            "optionType": "checkbox",
            "value": "874",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=874"
          },
          {
            "optionType": "checkbox",
            "value": "860",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=860"
          },
          {
            "optionType": "checkbox",
            "value": "846",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=846"
          },
          {
            "optionType": "checkbox",
            "value": "1650",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1650"
          },
          {
            "optionType": "checkbox",
            "value": "1311",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1311"
          },
          {
            "optionType": "checkbox",
            "value": "666",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=666"
          },
          {
            "optionType": "checkbox",
            "value": "657",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=657"
          },
          {
            "optionType": "checkbox",
            "value": "648",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=648"
          },
          {
            "optionType": "checkbox",
            "value": "1310",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1310"
          },
          {
            "optionType": "checkbox",
            "value": "778",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=778"
          },
          {
            "optionType": "checkbox",
            "value": "761",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=761"
          },
          {
            "optionType": "checkbox",
            "value": "744",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=744"
          },
          {
            "optionType": "checkbox",
            "value": "727",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=727"
          },
          {
            "optionType": "checkbox",
            "value": "710",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=710"
          },
          {
            "optionType": "checkbox",
            "value": "693",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=693"
          },
          {
            "optionType": "checkbox",
            "value": "676",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=676"
          },
          {
            "optionType": "checkbox",
            "value": "2051",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=2051"
          },
          {
            "optionType": "checkbox",
            "value": "4354",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=4354"
          },
          {
            "optionType": "checkbox",
            "value": "4796",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=4796"
          },
          {
            "optionType": "checkbox",
            "value": "5435",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=5435"
          },
          {
            "optionType": "checkbox",
            "value": "4795",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=4795"
          },
          {
            "optionType": "checkbox",
            "value": "1444",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1444"
          }
        ],
        "inputs": [
          {
            "inputType": "text",
            "label": "Mikron",
            "name": "EkAlan",
            "sourceText": "text (Mikron) name=EkAlan"
          }
        ],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 57,
        "labeledOptionCount": 0,
        "placeholderOptionCount": 57,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": true,
          "criticalOptionCountHeuristic": 0
        }
      },
      {
        "order": 31,
        "itemNo": 31,
        "noktaId": "471",
        "itemId": "n471-sag-arka-kapi-ici",
        "title": "Sağ Arka Kapı İçi",
        "moduleId": "kaporta-boya",
        "moduleTitle": "KAPORTA - BOYA EKSPERTİZ VE CHECK-UP",
        "statusOptions": [],
        "options": [
          {
            "optionType": "checkbox",
            "value": "1988",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1988"
          },
          {
            "optionType": "checkbox",
            "value": "1985",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1985"
          },
          {
            "optionType": "checkbox",
            "value": "1986",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1986"
          },
          {
            "optionType": "checkbox",
            "value": "2859",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=2859"
          },
          {
            "optionType": "checkbox",
            "value": "3035",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=3035"
          },
          {
            "optionType": "checkbox",
            "value": "3134",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=3134"
          },
          {
            "optionType": "checkbox",
            "value": "3136",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=3136"
          },
          {
            "optionType": "checkbox",
            "value": "4355",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=4355"
          },
          {
            "optionType": "checkbox",
            "value": "4778",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=4778"
          },
          {
            "optionType": "checkbox",
            "value": "5436",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=5436"
          },
          {
            "optionType": "checkbox",
            "value": "5532",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=5532"
          },
          {
            "optionType": "checkbox",
            "value": "5533",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=5533"
          },
          {
            "optionType": "checkbox",
            "value": "9291",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=9291"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 13,
        "labeledOptionCount": 0,
        "placeholderOptionCount": 13,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": true,
          "criticalOptionCountHeuristic": 0
        }
      },
      {
        "order": 32,
        "itemNo": 32,
        "noktaId": "469",
        "itemId": "n469-sag-orta-ic-direk",
        "title": "Sağ Orta İç Direk",
        "moduleId": "kaporta-boya",
        "moduleTitle": "KAPORTA - BOYA EKSPERTİZ VE CHECK-UP",
        "statusOptions": [],
        "options": [
          {
            "optionType": "checkbox",
            "value": "1992",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1992"
          },
          {
            "optionType": "checkbox",
            "value": "1990",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1990"
          },
          {
            "optionType": "checkbox",
            "value": "1991",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1991"
          },
          {
            "optionType": "checkbox",
            "value": "1989",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1989"
          },
          {
            "optionType": "checkbox",
            "value": "2744",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=2744"
          },
          {
            "optionType": "checkbox",
            "value": "2746",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=2746"
          },
          {
            "optionType": "checkbox",
            "value": "2747",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=2747"
          },
          {
            "optionType": "checkbox",
            "value": "2745",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=2745"
          },
          {
            "optionType": "checkbox",
            "value": "4356",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=4356"
          },
          {
            "optionType": "checkbox",
            "value": "4784",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=4784"
          },
          {
            "optionType": "checkbox",
            "value": "4788",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=4788"
          },
          {
            "optionType": "checkbox",
            "value": "5438",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=5438"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 12,
        "labeledOptionCount": 0,
        "placeholderOptionCount": 12,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": true,
          "criticalOptionCountHeuristic": 0
        }
      },
      {
        "order": 33,
        "itemNo": 33,
        "noktaId": "28",
        "itemId": "n28-sag-on-kapi",
        "title": "Sağ Ön Kapı",
        "moduleId": "kaporta-boya",
        "moduleTitle": "KAPORTA - BOYA EKSPERTİZ VE CHECK-UP",
        "statusOptions": [],
        "options": [
          {
            "optionType": "checkbox",
            "value": "37",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=37"
          },
          {
            "optionType": "checkbox",
            "value": "3658",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=3658"
          },
          {
            "optionType": "checkbox",
            "value": "1316",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1316"
          },
          {
            "optionType": "checkbox",
            "value": "331",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=331"
          },
          {
            "optionType": "checkbox",
            "value": "305",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=305"
          },
          {
            "optionType": "checkbox",
            "value": "279",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=279"
          },
          {
            "optionType": "checkbox",
            "value": "253",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=253"
          },
          {
            "optionType": "checkbox",
            "value": "227",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=227"
          },
          {
            "optionType": "checkbox",
            "value": "201",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=201"
          },
          {
            "optionType": "checkbox",
            "value": "175",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=175"
          },
          {
            "optionType": "checkbox",
            "value": "1318",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1318"
          },
          {
            "optionType": "checkbox",
            "value": "390",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=390"
          },
          {
            "optionType": "checkbox",
            "value": "380",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=380"
          },
          {
            "optionType": "checkbox",
            "value": "370",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=370"
          },
          {
            "optionType": "checkbox",
            "value": "360",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=360"
          },
          {
            "optionType": "checkbox",
            "value": "350",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=350"
          },
          {
            "optionType": "checkbox",
            "value": "1317",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1317"
          },
          {
            "optionType": "checkbox",
            "value": "588",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=588"
          },
          {
            "optionType": "checkbox",
            "value": "558",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=558"
          },
          {
            "optionType": "checkbox",
            "value": "528",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=528"
          },
          {
            "optionType": "checkbox",
            "value": "498",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=498"
          },
          {
            "optionType": "checkbox",
            "value": "468",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=468"
          },
          {
            "optionType": "checkbox",
            "value": "438",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=438"
          },
          {
            "optionType": "checkbox",
            "value": "408",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=408"
          },
          {
            "optionType": "checkbox",
            "value": "66",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=66"
          },
          {
            "optionType": "checkbox",
            "value": "159",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=159"
          },
          {
            "optionType": "checkbox",
            "value": "131",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=131"
          },
          {
            "optionType": "checkbox",
            "value": "103",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=103"
          },
          {
            "optionType": "checkbox",
            "value": "75",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=75"
          },
          {
            "optionType": "checkbox",
            "value": "1513",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1513"
          },
          {
            "optionType": "checkbox",
            "value": "831",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=831"
          },
          {
            "optionType": "checkbox",
            "value": "814",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=814"
          },
          {
            "optionType": "checkbox",
            "value": "797",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=797"
          },
          {
            "optionType": "checkbox",
            "value": "1514",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1514"
          },
          {
            "optionType": "checkbox",
            "value": "889",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=889"
          },
          {
            "optionType": "checkbox",
            "value": "875",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=875"
          },
          {
            "optionType": "checkbox",
            "value": "861",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=861"
          },
          {
            "optionType": "checkbox",
            "value": "847",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=847"
          },
          {
            "optionType": "checkbox",
            "value": "1651",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1651"
          },
          {
            "optionType": "checkbox",
            "value": "1320",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1320"
          },
          {
            "optionType": "checkbox",
            "value": "667",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=667"
          },
          {
            "optionType": "checkbox",
            "value": "658",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=658"
          },
          {
            "optionType": "checkbox",
            "value": "649",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=649"
          },
          {
            "optionType": "checkbox",
            "value": "1319",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1319"
          },
          {
            "optionType": "checkbox",
            "value": "779",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=779"
          },
          {
            "optionType": "checkbox",
            "value": "762",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=762"
          },
          {
            "optionType": "checkbox",
            "value": "745",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=745"
          },
          {
            "optionType": "checkbox",
            "value": "728",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=728"
          },
          {
            "optionType": "checkbox",
            "value": "711",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=711"
          },
          {
            "optionType": "checkbox",
            "value": "694",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=694"
          },
          {
            "optionType": "checkbox",
            "value": "677",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=677"
          },
          {
            "optionType": "checkbox",
            "value": "2052",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=2052"
          },
          {
            "optionType": "checkbox",
            "value": "4357",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=4357"
          },
          {
            "optionType": "checkbox",
            "value": "4798",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=4798"
          },
          {
            "optionType": "checkbox",
            "value": "5439",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=5439"
          },
          {
            "optionType": "checkbox",
            "value": "4797",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=4797"
          }
        ],
        "inputs": [
          {
            "inputType": "text",
            "label": "Mikron",
            "name": "EkAlan",
            "sourceText": "text (Mikron) name=EkAlan"
          }
        ],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 56,
        "labeledOptionCount": 0,
        "placeholderOptionCount": 56,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": true,
          "criticalOptionCountHeuristic": 0
        }
      },
      {
        "order": 34,
        "itemNo": 34,
        "noktaId": "27",
        "itemId": "n27-sag-on-camurluk",
        "title": "Sağ Ön Çamurluk",
        "moduleId": "kaporta-boya",
        "moduleTitle": "KAPORTA - BOYA EKSPERTİZ VE CHECK-UP",
        "statusOptions": [],
        "options": [
          {
            "optionType": "checkbox",
            "value": "36",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=36"
          },
          {
            "optionType": "checkbox",
            "value": "1325",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1325"
          },
          {
            "optionType": "checkbox",
            "value": "1322",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1322"
          },
          {
            "optionType": "checkbox",
            "value": "332",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=332"
          },
          {
            "optionType": "checkbox",
            "value": "306",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=306"
          },
          {
            "optionType": "checkbox",
            "value": "280",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=280"
          },
          {
            "optionType": "checkbox",
            "value": "254",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=254"
          },
          {
            "optionType": "checkbox",
            "value": "228",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=228"
          },
          {
            "optionType": "checkbox",
            "value": "202",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=202"
          },
          {
            "optionType": "checkbox",
            "value": "176",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=176"
          },
          {
            "optionType": "checkbox",
            "value": "1326",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1326"
          },
          {
            "optionType": "checkbox",
            "value": "391",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=391"
          },
          {
            "optionType": "checkbox",
            "value": "381",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=381"
          },
          {
            "optionType": "checkbox",
            "value": "371",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=371"
          },
          {
            "optionType": "checkbox",
            "value": "361",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=361"
          },
          {
            "optionType": "checkbox",
            "value": "351",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=351"
          },
          {
            "optionType": "checkbox",
            "value": "65",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=65"
          },
          {
            "optionType": "checkbox",
            "value": "158",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=158"
          },
          {
            "optionType": "checkbox",
            "value": "130",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=130"
          },
          {
            "optionType": "checkbox",
            "value": "102",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=102"
          },
          {
            "optionType": "checkbox",
            "value": "74",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=74"
          },
          {
            "optionType": "checkbox",
            "value": "1323",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1323"
          },
          {
            "optionType": "checkbox",
            "value": "589",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=589"
          },
          {
            "optionType": "checkbox",
            "value": "559",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=559"
          },
          {
            "optionType": "checkbox",
            "value": "529",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=529"
          },
          {
            "optionType": "checkbox",
            "value": "499",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=499"
          },
          {
            "optionType": "checkbox",
            "value": "439",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=439"
          },
          {
            "optionType": "checkbox",
            "value": "409",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=409"
          },
          {
            "optionType": "checkbox",
            "value": "1515",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1515"
          },
          {
            "optionType": "checkbox",
            "value": "832",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=832"
          },
          {
            "optionType": "checkbox",
            "value": "815",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=815"
          },
          {
            "optionType": "checkbox",
            "value": "798",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=798"
          },
          {
            "optionType": "checkbox",
            "value": "1516",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1516"
          },
          {
            "optionType": "checkbox",
            "value": "890",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=890"
          },
          {
            "optionType": "checkbox",
            "value": "876",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=876"
          },
          {
            "optionType": "checkbox",
            "value": "862",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=862"
          },
          {
            "optionType": "checkbox",
            "value": "848",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=848"
          },
          {
            "optionType": "checkbox",
            "value": "1652",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1652"
          },
          {
            "optionType": "checkbox",
            "value": "1328",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1328"
          },
          {
            "optionType": "checkbox",
            "value": "668",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=668"
          },
          {
            "optionType": "checkbox",
            "value": "659",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=659"
          },
          {
            "optionType": "checkbox",
            "value": "650",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=650"
          },
          {
            "optionType": "checkbox",
            "value": "1324",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1324"
          },
          {
            "optionType": "checkbox",
            "value": "780",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=780"
          },
          {
            "optionType": "checkbox",
            "value": "763",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=763"
          },
          {
            "optionType": "checkbox",
            "value": "746",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=746"
          },
          {
            "optionType": "checkbox",
            "value": "729",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=729"
          },
          {
            "optionType": "checkbox",
            "value": "712",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=712"
          },
          {
            "optionType": "checkbox",
            "value": "695",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=695"
          },
          {
            "optionType": "checkbox",
            "value": "678",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=678"
          },
          {
            "optionType": "checkbox",
            "value": "5440",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=5440"
          },
          {
            "optionType": "checkbox",
            "value": "4358",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=4358"
          },
          {
            "optionType": "checkbox",
            "value": "2733",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=2733"
          },
          {
            "optionType": "checkbox",
            "value": "4800",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=4800"
          },
          {
            "optionType": "checkbox",
            "value": "4799",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=4799"
          }
        ],
        "inputs": [
          {
            "inputType": "text",
            "label": "Mikron",
            "name": "EkAlan",
            "sourceText": "text (Mikron) name=EkAlan"
          }
        ],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 55,
        "labeledOptionCount": 0,
        "placeholderOptionCount": 55,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": true,
          "criticalOptionCountHeuristic": 0
        }
      },
      {
        "order": 35,
        "itemNo": 35,
        "noktaId": "16",
        "itemId": "n16-on-cam",
        "title": "Ön - Cam",
        "moduleId": "kaporta-boya",
        "moduleTitle": "KAPORTA - BOYA EKSPERTİZ VE CHECK-UP",
        "statusOptions": [],
        "options": [
          {
            "optionType": "checkbox",
            "value": "1353",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1353"
          },
          {
            "optionType": "checkbox",
            "value": "6646",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=6646"
          },
          {
            "optionType": "checkbox",
            "value": "476",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=476"
          },
          {
            "optionType": "checkbox",
            "value": "1352",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1352"
          },
          {
            "optionType": "checkbox",
            "value": "54",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=54"
          },
          {
            "optionType": "checkbox",
            "value": "147",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=147"
          },
          {
            "optionType": "checkbox",
            "value": "119",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=119"
          },
          {
            "optionType": "checkbox",
            "value": "91",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=91"
          },
          {
            "optionType": "checkbox",
            "value": "63",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=63"
          },
          {
            "optionType": "checkbox",
            "value": "7301",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=7301"
          },
          {
            "optionType": "checkbox",
            "value": "25",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=25"
          }
        ],
        "inputs": [
          {
            "inputType": "text",
            "label": "Tarih",
            "name": "EkAlan",
            "sourceText": "text (Tarih) name=EkAlan"
          }
        ],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 11,
        "labeledOptionCount": 0,
        "placeholderOptionCount": 11,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": true,
          "criticalOptionCountHeuristic": 0
        }
      },
      {
        "order": 36,
        "itemNo": 36,
        "noktaId": "17",
        "itemId": "n17-sunroof",
        "title": "Sunroof",
        "moduleId": "kaporta-boya",
        "moduleTitle": "KAPORTA - BOYA EKSPERTİZ VE CHECK-UP",
        "statusOptions": [],
        "options": [
          {
            "optionType": "checkbox",
            "value": "55",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=55"
          },
          {
            "optionType": "checkbox",
            "value": "148",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=148"
          },
          {
            "optionType": "checkbox",
            "value": "120",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=120"
          },
          {
            "optionType": "checkbox",
            "value": "92",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=92"
          },
          {
            "optionType": "checkbox",
            "value": "64",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=64"
          },
          {
            "optionType": "checkbox",
            "value": "960",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=960"
          },
          {
            "optionType": "checkbox",
            "value": "1354",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1354"
          },
          {
            "optionType": "checkbox",
            "value": "4060",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=4060"
          },
          {
            "optionType": "checkbox",
            "value": "4935",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=4935"
          }
        ],
        "inputs": [
          {
            "inputType": "text",
            "label": "Tarih",
            "name": "EkAlan",
            "sourceText": "text (Tarih) name=EkAlan"
          }
        ],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 9,
        "labeledOptionCount": 0,
        "placeholderOptionCount": 9,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": true,
          "criticalOptionCountHeuristic": 0
        }
      },
      {
        "order": 37,
        "itemNo": 37,
        "noktaId": "19",
        "itemId": "n19-arka-cam",
        "title": "Arka Cam",
        "moduleId": "kaporta-boya",
        "moduleTitle": "KAPORTA - BOYA EKSPERTİZ VE CHECK-UP",
        "statusOptions": [],
        "options": [
          {
            "optionType": "checkbox",
            "value": "7302",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=7302"
          },
          {
            "optionType": "checkbox",
            "value": "28",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=28"
          },
          {
            "optionType": "checkbox",
            "value": "57",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=57"
          },
          {
            "optionType": "checkbox",
            "value": "150",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=150"
          },
          {
            "optionType": "checkbox",
            "value": "122",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=122"
          },
          {
            "optionType": "checkbox",
            "value": "94",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=94"
          },
          {
            "optionType": "checkbox",
            "value": "66",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=66"
          },
          {
            "optionType": "checkbox",
            "value": "1361",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1361"
          },
          {
            "optionType": "checkbox",
            "value": "6647",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=6647"
          },
          {
            "optionType": "checkbox",
            "value": "478",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=478"
          },
          {
            "optionType": "checkbox",
            "value": "1360",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1360"
          },
          {
            "optionType": "checkbox",
            "value": "7596",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=7596"
          }
        ],
        "inputs": [
          {
            "inputType": "text",
            "label": "Tarih",
            "name": "EkAlan",
            "sourceText": "text (Tarih) name=EkAlan"
          }
        ],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 12,
        "labeledOptionCount": 0,
        "placeholderOptionCount": 12,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": true,
          "criticalOptionCountHeuristic": 0
        }
      },
      {
        "order": 38,
        "itemNo": 38,
        "noktaId": "20",
        "itemId": "n20-arka-bagaj",
        "title": "Arka Bagaj",
        "moduleId": "kaporta-boya",
        "moduleTitle": "KAPORTA - BOYA EKSPERTİZ VE CHECK-UP",
        "statusOptions": [],
        "options": [
          {
            "optionType": "checkbox",
            "value": "29",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=29"
          },
          {
            "optionType": "checkbox",
            "value": "1744",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1744"
          },
          {
            "optionType": "checkbox",
            "value": "1363",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1363"
          },
          {
            "optionType": "checkbox",
            "value": "339",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=339"
          },
          {
            "optionType": "checkbox",
            "value": "313",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=313"
          },
          {
            "optionType": "checkbox",
            "value": "287",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=287"
          },
          {
            "optionType": "checkbox",
            "value": "261",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=261"
          },
          {
            "optionType": "checkbox",
            "value": "235",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=235"
          },
          {
            "optionType": "checkbox",
            "value": "209",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=209"
          },
          {
            "optionType": "checkbox",
            "value": "183",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=183"
          },
          {
            "optionType": "checkbox",
            "value": "1365",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1365"
          },
          {
            "optionType": "checkbox",
            "value": "394",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=394"
          },
          {
            "optionType": "checkbox",
            "value": "384",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=384"
          },
          {
            "optionType": "checkbox",
            "value": "374",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=374"
          },
          {
            "optionType": "checkbox",
            "value": "364",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=364"
          },
          {
            "optionType": "checkbox",
            "value": "354",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=354"
          },
          {
            "optionType": "checkbox",
            "value": "58",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=58"
          },
          {
            "optionType": "checkbox",
            "value": "151",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=151"
          },
          {
            "optionType": "checkbox",
            "value": "123",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=123"
          },
          {
            "optionType": "checkbox",
            "value": "95",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=95"
          },
          {
            "optionType": "checkbox",
            "value": "67",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=67"
          },
          {
            "optionType": "checkbox",
            "value": "1362",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1362"
          },
          {
            "optionType": "checkbox",
            "value": "599",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=599"
          },
          {
            "optionType": "checkbox",
            "value": "569",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=569"
          },
          {
            "optionType": "checkbox",
            "value": "539",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=539"
          },
          {
            "optionType": "checkbox",
            "value": "509",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=509"
          },
          {
            "optionType": "checkbox",
            "value": "479",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=479"
          },
          {
            "optionType": "checkbox",
            "value": "449",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=449"
          },
          {
            "optionType": "checkbox",
            "value": "419",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=419"
          },
          {
            "optionType": "checkbox",
            "value": "1523",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1523"
          },
          {
            "optionType": "checkbox",
            "value": "836",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=836"
          },
          {
            "optionType": "checkbox",
            "value": "819",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=819"
          },
          {
            "optionType": "checkbox",
            "value": "802",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=802"
          },
          {
            "optionType": "checkbox",
            "value": "1524",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1524"
          },
          {
            "optionType": "checkbox",
            "value": "894",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=894"
          },
          {
            "optionType": "checkbox",
            "value": "880",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=880"
          },
          {
            "optionType": "checkbox",
            "value": "866",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=866"
          },
          {
            "optionType": "checkbox",
            "value": "852",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=852"
          },
          {
            "optionType": "checkbox",
            "value": "1653",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1653"
          },
          {
            "optionType": "checkbox",
            "value": "1367",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1367"
          },
          {
            "optionType": "checkbox",
            "value": "670",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=670"
          },
          {
            "optionType": "checkbox",
            "value": "661",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=661"
          },
          {
            "optionType": "checkbox",
            "value": "652",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=652"
          },
          {
            "optionType": "checkbox",
            "value": "1364",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1364"
          },
          {
            "optionType": "checkbox",
            "value": "784",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=784"
          },
          {
            "optionType": "checkbox",
            "value": "767",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=767"
          },
          {
            "optionType": "checkbox",
            "value": "750",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=750"
          },
          {
            "optionType": "checkbox",
            "value": "733",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=733"
          },
          {
            "optionType": "checkbox",
            "value": "716",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=716"
          },
          {
            "optionType": "checkbox",
            "value": "699",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=699"
          },
          {
            "optionType": "checkbox",
            "value": "682",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=682"
          },
          {
            "optionType": "checkbox",
            "value": "4359",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=4359"
          },
          {
            "optionType": "checkbox",
            "value": "4801",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=4801"
          },
          {
            "optionType": "checkbox",
            "value": "4802",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=4802"
          },
          {
            "optionType": "checkbox",
            "value": "5441",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=5441"
          },
          {
            "optionType": "checkbox",
            "value": "5603",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=5603"
          },
          {
            "optionType": "checkbox",
            "value": "7288",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=7288"
          }
        ],
        "inputs": [
          {
            "inputType": "text",
            "label": "Mikron",
            "name": "EkAlan",
            "sourceText": "text (Mikron) name=EkAlan"
          }
        ],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 57,
        "labeledOptionCount": 0,
        "placeholderOptionCount": 57,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": true,
          "criticalOptionCountHeuristic": 0
        }
      },
      {
        "order": 39,
        "itemNo": 39,
        "noktaId": "276",
        "itemId": "n276-sag-marsbiyel",
        "title": "Sağ Marşbiyel",
        "moduleId": "kaporta-boya",
        "moduleTitle": "KAPORTA - BOYA EKSPERTİZ VE CHECK-UP",
        "statusOptions": [],
        "options": [
          {
            "optionType": "checkbox",
            "value": "1379",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1379"
          },
          {
            "optionType": "checkbox",
            "value": "340",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=340"
          },
          {
            "optionType": "checkbox",
            "value": "314",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=314"
          },
          {
            "optionType": "checkbox",
            "value": "288",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=288"
          },
          {
            "optionType": "checkbox",
            "value": "262",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=262"
          },
          {
            "optionType": "checkbox",
            "value": "236",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=236"
          },
          {
            "optionType": "checkbox",
            "value": "210",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=210"
          },
          {
            "optionType": "checkbox",
            "value": "184",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=184"
          },
          {
            "optionType": "checkbox",
            "value": "1382",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1382"
          },
          {
            "optionType": "checkbox",
            "value": "1381",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1381"
          },
          {
            "optionType": "checkbox",
            "value": "600",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=600"
          },
          {
            "optionType": "checkbox",
            "value": "570",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=570"
          },
          {
            "optionType": "checkbox",
            "value": "540",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=540"
          },
          {
            "optionType": "checkbox",
            "value": "510",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=510"
          },
          {
            "optionType": "checkbox",
            "value": "480",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=480"
          },
          {
            "optionType": "checkbox",
            "value": "450",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=450"
          },
          {
            "optionType": "checkbox",
            "value": "420",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=420"
          },
          {
            "optionType": "checkbox",
            "value": "1378",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1378"
          },
          {
            "optionType": "checkbox",
            "value": "1383",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1383"
          },
          {
            "optionType": "checkbox",
            "value": "642",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=642"
          },
          {
            "optionType": "checkbox",
            "value": "629",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=629"
          },
          {
            "optionType": "checkbox",
            "value": "616",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=616"
          },
          {
            "optionType": "checkbox",
            "value": "1380",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1380"
          },
          {
            "optionType": "checkbox",
            "value": "785",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=785"
          },
          {
            "optionType": "checkbox",
            "value": "768",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=768"
          },
          {
            "optionType": "checkbox",
            "value": "751",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=751"
          },
          {
            "optionType": "checkbox",
            "value": "734",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=734"
          },
          {
            "optionType": "checkbox",
            "value": "717",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=717"
          },
          {
            "optionType": "checkbox",
            "value": "700",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=700"
          },
          {
            "optionType": "checkbox",
            "value": "683",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=683"
          },
          {
            "optionType": "checkbox",
            "value": "1376",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1376"
          },
          {
            "optionType": "checkbox",
            "value": "1525",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1525"
          },
          {
            "optionType": "checkbox",
            "value": "837",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=837"
          },
          {
            "optionType": "checkbox",
            "value": "820",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=820"
          },
          {
            "optionType": "checkbox",
            "value": "803",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=803"
          },
          {
            "optionType": "checkbox",
            "value": "1526",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1526"
          },
          {
            "optionType": "checkbox",
            "value": "895",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=895"
          },
          {
            "optionType": "checkbox",
            "value": "881",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=881"
          },
          {
            "optionType": "checkbox",
            "value": "867",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=867"
          },
          {
            "optionType": "checkbox",
            "value": "853",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=853"
          },
          {
            "optionType": "checkbox",
            "value": "4360",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=4360"
          },
          {
            "optionType": "checkbox",
            "value": "4365",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=4365"
          },
          {
            "optionType": "checkbox",
            "value": "4386",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=4386"
          },
          {
            "optionType": "checkbox",
            "value": "4779",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=4779"
          },
          {
            "optionType": "checkbox",
            "value": "4937",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=4937"
          },
          {
            "optionType": "checkbox",
            "value": "5437",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=5437"
          },
          {
            "optionType": "checkbox",
            "value": "8613",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=8613"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 47,
        "labeledOptionCount": 0,
        "placeholderOptionCount": 47,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": true,
          "criticalOptionCountHeuristic": 0
        }
      },
      {
        "order": 40,
        "itemNo": 40,
        "noktaId": "277",
        "itemId": "n277-sol-marsbiyel",
        "title": "Sol Marşbiyel",
        "moduleId": "kaporta-boya",
        "moduleTitle": "KAPORTA - BOYA EKSPERTİZ VE CHECK-UP",
        "statusOptions": [],
        "options": [
          {
            "optionType": "checkbox",
            "value": "1387",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1387"
          },
          {
            "optionType": "checkbox",
            "value": "341",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=341"
          },
          {
            "optionType": "checkbox",
            "value": "315",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=315"
          },
          {
            "optionType": "checkbox",
            "value": "289",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=289"
          },
          {
            "optionType": "checkbox",
            "value": "263",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=263"
          },
          {
            "optionType": "checkbox",
            "value": "237",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=237"
          },
          {
            "optionType": "checkbox",
            "value": "211",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=211"
          },
          {
            "optionType": "checkbox",
            "value": "185",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=185"
          },
          {
            "optionType": "checkbox",
            "value": "1391",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1391"
          },
          {
            "optionType": "checkbox",
            "value": "1389",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1389"
          },
          {
            "optionType": "checkbox",
            "value": "601",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=601"
          },
          {
            "optionType": "checkbox",
            "value": "571",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=571"
          },
          {
            "optionType": "checkbox",
            "value": "541",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=541"
          },
          {
            "optionType": "checkbox",
            "value": "511",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=511"
          },
          {
            "optionType": "checkbox",
            "value": "481",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=481"
          },
          {
            "optionType": "checkbox",
            "value": "451",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=451"
          },
          {
            "optionType": "checkbox",
            "value": "421",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=421"
          },
          {
            "optionType": "checkbox",
            "value": "1385",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1385"
          },
          {
            "optionType": "checkbox",
            "value": "1390",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1390"
          },
          {
            "optionType": "checkbox",
            "value": "643",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=643"
          },
          {
            "optionType": "checkbox",
            "value": "630",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=630"
          },
          {
            "optionType": "checkbox",
            "value": "617",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=617"
          },
          {
            "optionType": "checkbox",
            "value": "1388",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1388"
          },
          {
            "optionType": "checkbox",
            "value": "786",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=786"
          },
          {
            "optionType": "checkbox",
            "value": "769",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=769"
          },
          {
            "optionType": "checkbox",
            "value": "752",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=752"
          },
          {
            "optionType": "checkbox",
            "value": "735",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=735"
          },
          {
            "optionType": "checkbox",
            "value": "718",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=718"
          },
          {
            "optionType": "checkbox",
            "value": "701",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=701"
          },
          {
            "optionType": "checkbox",
            "value": "684",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=684"
          },
          {
            "optionType": "checkbox",
            "value": "1384",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1384"
          },
          {
            "optionType": "checkbox",
            "value": "1527",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1527"
          },
          {
            "optionType": "checkbox",
            "value": "838",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=838"
          },
          {
            "optionType": "checkbox",
            "value": "821",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=821"
          },
          {
            "optionType": "checkbox",
            "value": "804",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=804"
          },
          {
            "optionType": "checkbox",
            "value": "1528",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1528"
          },
          {
            "optionType": "checkbox",
            "value": "896",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=896"
          },
          {
            "optionType": "checkbox",
            "value": "882",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=882"
          },
          {
            "optionType": "checkbox",
            "value": "868",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=868"
          },
          {
            "optionType": "checkbox",
            "value": "854",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=854"
          },
          {
            "optionType": "checkbox",
            "value": "4361",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=4361"
          },
          {
            "optionType": "checkbox",
            "value": "4364",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=4364"
          },
          {
            "optionType": "checkbox",
            "value": "4387",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=4387"
          },
          {
            "optionType": "checkbox",
            "value": "4780",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=4780"
          },
          {
            "optionType": "checkbox",
            "value": "4938",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=4938"
          },
          {
            "optionType": "checkbox",
            "value": "5442",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=5442"
          },
          {
            "optionType": "checkbox",
            "value": "8614",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=8614"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 47,
        "labeledOptionCount": 0,
        "placeholderOptionCount": 47,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": true,
          "criticalOptionCountHeuristic": 0
        }
      },
      {
        "order": 41,
        "itemNo": 41,
        "noktaId": "315",
        "itemId": "n315-araca-kirli-halde-mi-ekspertiz-yapildi",
        "title": "Araca Kirli Halde mi Ekspertiz Yapıldı?",
        "moduleId": "kaporta-boya",
        "moduleTitle": "KAPORTA - BOYA EKSPERTİZ VE CHECK-UP",
        "statusOptions": [
          "Evet Araca müşteri bilgisinde yoğun kirli bakıldı mikron boya kuru çekiç düzeltme ezik çizik kontrolleri yeterli değildir.",
          "Hayır, Araç Temizdi"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "Evet Araca müşteri bilgisinde yoğun kirli bakıldı mikron boya kuru çekiç düzeltme ezik çizik kontrolleri yeterli değildir.",
            "label": "Evet Araca müşteri bilgisinde yoğun kirli bakıldı mikron boya kuru çekiç düzeltme ezik çizik kontrolleri yeterli değildir.",
            "displayLabel": "Evet Araca müşteri bilgisinde yoğun kirli bakıldı mikron boya kuru çekiç düzeltme ezik çizik kontrolleri yeterli değildir.",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Evet Araca müşteri bilgisinde yoğun kirli bakıldı mikron boya kuru çekiç düzeltme ezik çizik kontrolleri yeterli değildir."
          },
          {
            "optionType": "label",
            "value": "Hayır, Araç Temizdi",
            "label": "Hayır, Araç Temizdi",
            "displayLabel": "Hayır, Araç Temizdi",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Hayır, Araç Temizdi"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 2,
        "labeledOptionCount": 2,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 1
        }
      },
      {
        "order": 42,
        "itemNo": 42,
        "noktaId": "296",
        "itemId": "n296-arac-fiilen-agir-islemli-kategorisinde-mi-bu-yorum",
        "title": "Araç ''FİİLEN AĞIR İŞLEMLİ'' Kategorisinde mi? (Bu yorum usta görüşüdür.)",
        "moduleId": "kaporta-boya",
        "moduleTitle": "KAPORTA - BOYA EKSPERTİZ VE CHECK-UP",
        "statusOptions": [
          "Evet, Araç Ağır İşlemli",
          "Hayır, Araçta Ağır İşlem Görülmemiştir"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "Evet, Araç Ağır İşlemli",
            "label": "Evet, Araç Ağır İşlemli",
            "displayLabel": "Evet, Araç Ağır İşlemli",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Evet, Araç Ağır İşlemli"
          },
          {
            "optionType": "label",
            "value": "Hayır, Araçta Ağır İşlem Görülmemiştir",
            "label": "Hayır, Araçta Ağır İşlem Görülmemiştir",
            "displayLabel": "Hayır, Araçta Ağır İşlem Görülmemiştir",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Hayır, Araçta Ağır İşlem Görülmemiştir"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 2,
        "labeledOptionCount": 2,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 1
        }
      },
      {
        "order": 43,
        "itemNo": 43,
        "noktaId": "313",
        "itemId": "n313-arac-alt-tabani-kontrolu",
        "title": "Araç Alt Tabanı Kontrolü",
        "moduleId": "kaporta-boya",
        "moduleTitle": "KAPORTA - BOYA EKSPERTİZ VE CHECK-UP",
        "statusOptions": [],
        "options": [
          {
            "optionType": "checkbox",
            "value": "2035",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=2035"
          },
          {
            "optionType": "checkbox",
            "value": "1566",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1566"
          },
          {
            "optionType": "checkbox",
            "value": "1568",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1568"
          },
          {
            "optionType": "checkbox",
            "value": "2034",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=2034"
          },
          {
            "optionType": "checkbox",
            "value": "1565",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1565"
          },
          {
            "optionType": "checkbox",
            "value": "1567",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1567"
          },
          {
            "optionType": "checkbox",
            "value": "4806",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=4806"
          },
          {
            "optionType": "checkbox",
            "value": "5443",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=5443"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 8,
        "labeledOptionCount": 0,
        "placeholderOptionCount": 8,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": true,
          "criticalOptionCountHeuristic": 0
        }
      },
      {
        "order": 44,
        "itemNo": 44,
        "noktaId": "304",
        "itemId": "n304-karalama-kagidi",
        "title": "Karalama Kağıdı",
        "moduleId": "kaporta-boya",
        "moduleTitle": "KAPORTA - BOYA EKSPERTİZ VE CHECK-UP",
        "statusOptions": [
          "Karalama Kağıdı Fotoğrafı Eki"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "Karalama Kağıdı Fotoğrafı Eki",
            "label": "Karalama Kağıdı Fotoğrafı Eki",
            "displayLabel": "Karalama Kağıdı Fotoğrafı Eki",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Karalama Kağıdı Fotoğrafı Eki"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 1,
        "labeledOptionCount": 1,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": false,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 0
        }
      },
      {
        "order": 45,
        "itemNo": 45,
        "noktaId": "328",
        "itemId": "n328-sag-frangart-sag-ust-direk",
        "title": "Sağ Frangart (Sağ Üst Direk)",
        "moduleId": "kaporta-boya",
        "moduleTitle": "KAPORTA - BOYA EKSPERTİZ VE CHECK-UP",
        "statusOptions": [],
        "options": [
          {
            "optionType": "checkbox",
            "value": "1625",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1625"
          },
          {
            "optionType": "checkbox",
            "value": "1626",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1626"
          },
          {
            "optionType": "checkbox",
            "value": "342",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=342"
          },
          {
            "optionType": "checkbox",
            "value": "316",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=316"
          },
          {
            "optionType": "checkbox",
            "value": "290",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=290"
          },
          {
            "optionType": "checkbox",
            "value": "264",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=264"
          },
          {
            "optionType": "checkbox",
            "value": "238",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=238"
          },
          {
            "optionType": "checkbox",
            "value": "212",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=212"
          },
          {
            "optionType": "checkbox",
            "value": "186",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=186"
          },
          {
            "optionType": "checkbox",
            "value": "1629",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1629"
          },
          {
            "optionType": "checkbox",
            "value": "1627",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1627"
          },
          {
            "optionType": "checkbox",
            "value": "602",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=602"
          },
          {
            "optionType": "checkbox",
            "value": "572",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=572"
          },
          {
            "optionType": "checkbox",
            "value": "542",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=542"
          },
          {
            "optionType": "checkbox",
            "value": "512",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=512"
          },
          {
            "optionType": "checkbox",
            "value": "452",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=452"
          },
          {
            "optionType": "checkbox",
            "value": "1628",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1628"
          },
          {
            "optionType": "checkbox",
            "value": "839",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=839"
          },
          {
            "optionType": "checkbox",
            "value": "822",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=822"
          },
          {
            "optionType": "checkbox",
            "value": "805",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=805"
          },
          {
            "optionType": "checkbox",
            "value": "1630",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1630"
          },
          {
            "optionType": "checkbox",
            "value": "788",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=788"
          },
          {
            "optionType": "checkbox",
            "value": "771",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=771"
          },
          {
            "optionType": "checkbox",
            "value": "754",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=754"
          },
          {
            "optionType": "checkbox",
            "value": "737",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=737"
          },
          {
            "optionType": "checkbox",
            "value": "720",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=720"
          },
          {
            "optionType": "checkbox",
            "value": "703",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=703"
          },
          {
            "optionType": "checkbox",
            "value": "686",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=686"
          },
          {
            "optionType": "checkbox",
            "value": "1643",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1643"
          },
          {
            "optionType": "checkbox",
            "value": "4362",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=4362"
          },
          {
            "optionType": "checkbox",
            "value": "4807",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=4807"
          },
          {
            "optionType": "checkbox",
            "value": "4809",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=4809"
          },
          {
            "optionType": "checkbox",
            "value": "5444",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=5444"
          },
          {
            "optionType": "checkbox",
            "value": "5608",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=5608"
          },
          {
            "optionType": "checkbox",
            "value": "5610",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=5610"
          },
          {
            "optionType": "checkbox",
            "value": "7289",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=7289"
          },
          {
            "optionType": "checkbox",
            "value": "8664",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=8664"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 37,
        "labeledOptionCount": 0,
        "placeholderOptionCount": 37,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": true,
          "criticalOptionCountHeuristic": 0
        }
      },
      {
        "order": 46,
        "itemNo": 46,
        "noktaId": "327",
        "itemId": "n327-sol-frangart-sol-ust-direk",
        "title": "Sol Frangart (Sol Üst Direk)",
        "moduleId": "kaporta-boya",
        "moduleTitle": "KAPORTA - BOYA EKSPERTİZ VE CHECK-UP",
        "statusOptions": [],
        "options": [
          {
            "optionType": "checkbox",
            "value": "1632",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1632"
          },
          {
            "optionType": "checkbox",
            "value": "1631",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1631"
          },
          {
            "optionType": "checkbox",
            "value": "343",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=343"
          },
          {
            "optionType": "checkbox",
            "value": "317",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=317"
          },
          {
            "optionType": "checkbox",
            "value": "291",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=291"
          },
          {
            "optionType": "checkbox",
            "value": "265",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=265"
          },
          {
            "optionType": "checkbox",
            "value": "239",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=239"
          },
          {
            "optionType": "checkbox",
            "value": "213",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=213"
          },
          {
            "optionType": "checkbox",
            "value": "187",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=187"
          },
          {
            "optionType": "checkbox",
            "value": "1636",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1636"
          },
          {
            "optionType": "checkbox",
            "value": "1633",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1633"
          },
          {
            "optionType": "checkbox",
            "value": "603",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=603"
          },
          {
            "optionType": "checkbox",
            "value": "573",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=573"
          },
          {
            "optionType": "checkbox",
            "value": "543",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=543"
          },
          {
            "optionType": "checkbox",
            "value": "513",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=513"
          },
          {
            "optionType": "checkbox",
            "value": "453",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=453"
          },
          {
            "optionType": "checkbox",
            "value": "1635",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1635"
          },
          {
            "optionType": "checkbox",
            "value": "840",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=840"
          },
          {
            "optionType": "checkbox",
            "value": "823",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=823"
          },
          {
            "optionType": "checkbox",
            "value": "806",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=806"
          },
          {
            "optionType": "checkbox",
            "value": "1634",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1634"
          },
          {
            "optionType": "checkbox",
            "value": "789",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=789"
          },
          {
            "optionType": "checkbox",
            "value": "772",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=772"
          },
          {
            "optionType": "checkbox",
            "value": "755",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=755"
          },
          {
            "optionType": "checkbox",
            "value": "738",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=738"
          },
          {
            "optionType": "checkbox",
            "value": "721",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=721"
          },
          {
            "optionType": "checkbox",
            "value": "704",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=704"
          },
          {
            "optionType": "checkbox",
            "value": "687",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=687"
          },
          {
            "optionType": "checkbox",
            "value": "1642",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1642"
          },
          {
            "optionType": "checkbox",
            "value": "4363",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=4363"
          },
          {
            "optionType": "checkbox",
            "value": "4808",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=4808"
          },
          {
            "optionType": "checkbox",
            "value": "4810",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=4810"
          },
          {
            "optionType": "checkbox",
            "value": "5445",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=5445"
          },
          {
            "optionType": "checkbox",
            "value": "5609",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=5609"
          },
          {
            "optionType": "checkbox",
            "value": "5611",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=5611"
          },
          {
            "optionType": "checkbox",
            "value": "7290",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=7290"
          },
          {
            "optionType": "checkbox",
            "value": "8666",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=8666"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 37,
        "labeledOptionCount": 0,
        "placeholderOptionCount": 37,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": true,
          "criticalOptionCountHeuristic": 0
        }
      },
      {
        "order": 47,
        "itemNo": 47,
        "noktaId": "990",
        "itemId": "n990-bu-araci-kendinize-ya-da-bir-akrabaniza-alir-misin",
        "title": "Bu aracı kendinize ya da bir akrabanıza alır mısınız? (Bu soru testte görünmeyecektir.)",
        "moduleId": "kaporta-boya",
        "moduleTitle": "KAPORTA - BOYA EKSPERTİZ VE CHECK-UP",
        "statusOptions": [
          "Evet",
          "Hayır"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "Evet",
            "label": "Evet",
            "displayLabel": "Evet",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Evet"
          },
          {
            "optionType": "label",
            "value": "Hayır",
            "label": "Hayır",
            "displayLabel": "Hayır",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Hayır"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 2,
        "labeledOptionCount": 2,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 1
        }
      },
      {
        "order": 48,
        "itemNo": 48,
        "noktaId": "997",
        "itemId": "n997-gosterge-panelinde-airbag-isigi-yaniyor-mu",
        "title": "Gösterge Panelinde Airbag Işığı Yanıyor mu?",
        "moduleId": "kaporta-boya",
        "moduleTitle": "KAPORTA - BOYA EKSPERTİZ VE CHECK-UP",
        "statusOptions": [
          "Hayır",
          "Evet, Servis Kontrolü Gerekli"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "Hayır",
            "label": "Hayır",
            "displayLabel": "Hayır",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Hayır"
          },
          {
            "optionType": "label",
            "value": "Evet, Servis Kontrolü Gerekli",
            "label": "Evet, Servis Kontrolü Gerekli",
            "displayLabel": "Evet, Servis Kontrolü Gerekli",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Evet, Servis Kontrolü Gerekli"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 2,
        "labeledOptionCount": 2,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 1
        }
      },
      {
        "order": 49,
        "itemNo": 49,
        "noktaId": "889",
        "itemId": "n889-arac-alt-on-kisim-fotografi",
        "title": "Araç Alt Ön Kısım Fotoğrafı",
        "moduleId": "kaporta-boya",
        "moduleTitle": "KAPORTA - BOYA EKSPERTİZ VE CHECK-UP",
        "statusOptions": [
          "Araç Alt Ön Kısım Fotoğrafı"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "Araç Alt Ön Kısım Fotoğrafı",
            "label": "Araç Alt Ön Kısım Fotoğrafı",
            "displayLabel": "Araç Alt Ön Kısım Fotoğrafı",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Araç Alt Ön Kısım Fotoğrafı"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 1,
        "labeledOptionCount": 1,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": false,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 0
        }
      },
      {
        "order": 50,
        "itemNo": 50,
        "noktaId": "888",
        "itemId": "n888-arac-alt-orta-kisim-fotografi",
        "title": "Araç Alt Orta Kısım Fotoğrafı",
        "moduleId": "kaporta-boya",
        "moduleTitle": "KAPORTA - BOYA EKSPERTİZ VE CHECK-UP",
        "statusOptions": [
          "Araç Alt Orta Kısım Fotoğrafı"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "Araç Alt Orta Kısım Fotoğrafı",
            "label": "Araç Alt Orta Kısım Fotoğrafı",
            "displayLabel": "Araç Alt Orta Kısım Fotoğrafı",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Araç Alt Orta Kısım Fotoğrafı"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 1,
        "labeledOptionCount": 1,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": false,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 0
        }
      },
      {
        "order": 51,
        "itemNo": 51,
        "noktaId": "887",
        "itemId": "n887-arac-alt-arka-kisim-fotografi",
        "title": "Araç Alt Arka Kısım Fotoğrafı",
        "moduleId": "kaporta-boya",
        "moduleTitle": "KAPORTA - BOYA EKSPERTİZ VE CHECK-UP",
        "statusOptions": [
          "Araç Alt Arka Kısım Fotoğrafı"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "Araç Alt Arka Kısım Fotoğrafı",
            "label": "Araç Alt Arka Kısım Fotoğrafı",
            "displayLabel": "Araç Alt Arka Kısım Fotoğrafı",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Araç Alt Arka Kısım Fotoğrafı"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 1,
        "labeledOptionCount": 1,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": false,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 0
        }
      },
      {
        "order": 52,
        "itemNo": 52,
        "noktaId": "1066",
        "itemId": "n1066-airbag-hava-yastiklari-usta-kanaati",
        "title": "Airbag (Hava Yastıkları) Usta Kanaati",
        "moduleId": "kaporta-boya",
        "moduleTitle": "KAPORTA - BOYA EKSPERTİZ VE CHECK-UP",
        "statusOptions": [
          "Otorapor Airbag Kontrol Paketi Uygulanmadıysa Yetkili Serviste İncelenmesi Gereklidir."
        ],
        "options": [
          {
            "optionType": "label",
            "value": "Otorapor Airbag Kontrol Paketi Uygulanmadıysa Yetkili Serviste İncelenmesi Gereklidir.",
            "label": "Otorapor Airbag Kontrol Paketi Uygulanmadıysa Yetkili Serviste İncelenmesi Gereklidir.",
            "displayLabel": "Otorapor Airbag Kontrol Paketi Uygulanmadıysa Yetkili Serviste İncelenmesi Gereklidir.",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Otorapor Airbag Kontrol Paketi Uygulanmadıysa Yetkili Serviste İncelenmesi Gereklidir."
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 1,
        "labeledOptionCount": 1,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 1
        }
      },
      {
        "order": 53,
        "itemNo": 53,
        "noktaId": "1256",
        "itemId": "n1256-arac-genelinde-dolu-hasari-mevcut-mu",
        "title": "Araç Genelinde Dolu Hasarı Mevcut Mu ?",
        "moduleId": "kaporta-boya",
        "moduleTitle": "KAPORTA - BOYA EKSPERTİZ VE CHECK-UP",
        "statusOptions": [
          "Evet",
          "Hayır"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "Evet",
            "label": "Evet",
            "displayLabel": "Evet",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Evet"
          },
          {
            "optionType": "label",
            "value": "Hayır",
            "label": "Hayır",
            "displayLabel": "Hayır",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Hayır"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 2,
        "labeledOptionCount": 2,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 1
        }
      },
      {
        "order": 54,
        "itemNo": 54,
        "noktaId": "1251",
        "itemId": "n1251-sag-on-kapi-ici",
        "title": "Sağ Ön Kapı İçi",
        "moduleId": "kaporta-boya",
        "moduleTitle": "KAPORTA - BOYA EKSPERTİZ VE CHECK-UP",
        "statusOptions": [],
        "options": [
          {
            "optionType": "checkbox",
            "value": "5500",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=5500"
          },
          {
            "optionType": "checkbox",
            "value": "5501",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=5501"
          },
          {
            "optionType": "checkbox",
            "value": "5502",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=5502"
          },
          {
            "optionType": "checkbox",
            "value": "5503",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=5503"
          },
          {
            "optionType": "checkbox",
            "value": "5504",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=5504"
          },
          {
            "optionType": "checkbox",
            "value": "5505",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=5505"
          },
          {
            "optionType": "checkbox",
            "value": "5506",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=5506"
          },
          {
            "optionType": "checkbox",
            "value": "5507",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=5507"
          },
          {
            "optionType": "checkbox",
            "value": "5508",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=5508"
          },
          {
            "optionType": "checkbox",
            "value": "5509",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=5509"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 10,
        "labeledOptionCount": 0,
        "placeholderOptionCount": 10,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": true,
          "criticalOptionCountHeuristic": 0
        }
      },
      {
        "order": 55,
        "itemNo": 55,
        "noktaId": "1577",
        "itemId": "n1577-sag-on-sasi-ucu",
        "title": "Sağ Ön Şasi Ucu",
        "moduleId": "kaporta-boya",
        "moduleTitle": "KAPORTA - BOYA EKSPERTİZ VE CHECK-UP",
        "statusOptions": [
          "Orijinal",
          "İşlemli",
          "Hasarlı/Deforme"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "Orijinal",
            "label": "Orijinal",
            "displayLabel": "Orijinal",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Orijinal"
          },
          {
            "optionType": "label",
            "value": "İşlemli",
            "label": "İşlemli",
            "displayLabel": "İşlemli",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "İşlemli"
          },
          {
            "optionType": "label",
            "value": "Hasarlı/Deforme",
            "label": "Hasarlı/Deforme",
            "displayLabel": "Hasarlı/Deforme",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Hasarlı/Deforme"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 3,
        "labeledOptionCount": 3,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 2
        }
      },
      {
        "order": 56,
        "itemNo": 56,
        "noktaId": "1250",
        "itemId": "n1250-sol-on-kapi-ici",
        "title": "Sol Ön Kapı İçi",
        "moduleId": "kaporta-boya",
        "moduleTitle": "KAPORTA - BOYA EKSPERTİZ VE CHECK-UP",
        "statusOptions": [],
        "options": [
          {
            "optionType": "checkbox",
            "value": "5490",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=5490"
          },
          {
            "optionType": "checkbox",
            "value": "5491",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=5491"
          },
          {
            "optionType": "checkbox",
            "value": "5492",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=5492"
          },
          {
            "optionType": "checkbox",
            "value": "5493",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=5493"
          },
          {
            "optionType": "checkbox",
            "value": "5494",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=5494"
          },
          {
            "optionType": "checkbox",
            "value": "5495",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=5495"
          },
          {
            "optionType": "checkbox",
            "value": "5496",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=5496"
          },
          {
            "optionType": "checkbox",
            "value": "5497",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=5497"
          },
          {
            "optionType": "checkbox",
            "value": "5498",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=5498"
          },
          {
            "optionType": "checkbox",
            "value": "5499",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=5499"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 10,
        "labeledOptionCount": 0,
        "placeholderOptionCount": 10,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": true,
          "criticalOptionCountHeuristic": 0
        }
      },
      {
        "order": 57,
        "itemNo": 57,
        "noktaId": "1578",
        "itemId": "n1578-sol-on-sasi-ucu",
        "title": "Sol Ön Şasi Ucu",
        "moduleId": "kaporta-boya",
        "moduleTitle": "KAPORTA - BOYA EKSPERTİZ VE CHECK-UP",
        "statusOptions": [
          "Orijinal",
          "İşlemli",
          "Hasarlı/Deforme"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "Orijinal",
            "label": "Orijinal",
            "displayLabel": "Orijinal",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Orijinal"
          },
          {
            "optionType": "label",
            "value": "İşlemli",
            "label": "İşlemli",
            "displayLabel": "İşlemli",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "İşlemli"
          },
          {
            "optionType": "label",
            "value": "Hasarlı/Deforme",
            "label": "Hasarlı/Deforme",
            "displayLabel": "Hasarlı/Deforme",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Hasarlı/Deforme"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 3,
        "labeledOptionCount": 3,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 2
        }
      },
      {
        "order": 58,
        "itemNo": 58,
        "noktaId": "1875",
        "itemId": "n1875-arac-genelinde-dolu-onarimi-mevcut-mu",
        "title": "Araç Genelinde Dolu Onarımı Mevcut mu?",
        "moduleId": "kaporta-boya",
        "moduleTitle": "KAPORTA - BOYA EKSPERTİZ VE CHECK-UP",
        "statusOptions": [
          "Evet",
          "Hayır"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "Evet",
            "label": "Evet",
            "displayLabel": "Evet",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Evet"
          },
          {
            "optionType": "label",
            "value": "Hayır",
            "label": "Hayır",
            "displayLabel": "Hayır",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Hayır"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 2,
        "labeledOptionCount": 2,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 1
        }
      },
      {
        "order": 59,
        "itemNo": 59,
        "noktaId": "1879",
        "itemId": "n1879-arac-genelinde-kus-pisligi-ve-boya-bozulmalari-mev",
        "title": "Araç Genelinde Kuş Pisliği ve Boya Bozulmaları Mevcut mu?",
        "moduleId": "kaporta-boya",
        "moduleTitle": "KAPORTA - BOYA EKSPERTİZ VE CHECK-UP",
        "statusOptions": [
          "Evet",
          "Hayır"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "Evet",
            "label": "Evet",
            "displayLabel": "Evet",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Evet"
          },
          {
            "optionType": "label",
            "value": "Hayır",
            "label": "Hayır",
            "displayLabel": "Hayır",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Hayır"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 2,
        "labeledOptionCount": 2,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 1
        }
      }
    ]
  },
  {
    "moduleNo": 5,
    "moduleId": "obd-beyin",
    "key": "obd-beyin",
    "title": "OBD/BEYİN TEST",
    "shortTitle": "OBD / Beyin",
    "groupTitle": "OBD/BEYİN TEST",
    "groupTitles": [
      "OBD/BEYİN TEST"
    ],
    "itemCount": 10,
    "items": [
      {
        "order": 1,
        "itemNo": 1,
        "noktaId": "201",
        "itemId": "n201-hava-yastigi-elektronigi",
        "title": "Hava Yastığı Elektroniği",
        "moduleId": "obd-beyin",
        "moduleTitle": "OBD/BEYİN TEST",
        "statusOptions": [
          "Arıza Kaydı Yok",
          "Arıza Kaydı Mevcut",
          "Yok"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "Arıza Kaydı Yok",
            "label": "Arıza Kaydı Yok",
            "displayLabel": "Arıza Kaydı Yok",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Arıza Kaydı Yok"
          },
          {
            "optionType": "label",
            "value": "Arıza Kaydı Mevcut",
            "label": "Arıza Kaydı Mevcut",
            "displayLabel": "Arıza Kaydı Mevcut",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Arıza Kaydı Mevcut"
          },
          {
            "optionType": "label",
            "value": "Yok",
            "label": "Yok",
            "displayLabel": "Yok",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Yok"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 3,
        "labeledOptionCount": 3,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 3
        }
      },
      {
        "order": 2,
        "itemNo": 2,
        "noktaId": "202",
        "itemId": "n202-motor-isigi",
        "title": "Motor Işığı",
        "moduleId": "obd-beyin",
        "moduleTitle": "OBD/BEYİN TEST",
        "statusOptions": [
          "Yanıyor",
          "Yanmıyor"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "Yanıyor",
            "label": "Yanıyor",
            "displayLabel": "Yanıyor",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Yanıyor"
          },
          {
            "optionType": "label",
            "value": "Yanmıyor",
            "label": "Yanmıyor",
            "displayLabel": "Yanmıyor",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Yanmıyor"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 2,
        "labeledOptionCount": 2,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 1
        }
      },
      {
        "order": 3,
        "itemNo": 3,
        "noktaId": "203",
        "itemId": "n203-abs-esp-esr-elektronigi",
        "title": "ABS /ESP/ESR Elektroniği",
        "moduleId": "obd-beyin",
        "moduleTitle": "OBD/BEYİN TEST",
        "statusOptions": [
          "Arıza Kaydı Yok",
          "Arıza Kaydı Mevcut",
          "Yok"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "Arıza Kaydı Yok",
            "label": "Arıza Kaydı Yok",
            "displayLabel": "Arıza Kaydı Yok",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Arıza Kaydı Yok"
          },
          {
            "optionType": "label",
            "value": "Arıza Kaydı Mevcut",
            "label": "Arıza Kaydı Mevcut",
            "displayLabel": "Arıza Kaydı Mevcut",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Arıza Kaydı Mevcut"
          },
          {
            "optionType": "label",
            "value": "Yok",
            "label": "Yok",
            "displayLabel": "Yok",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Yok"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 3,
        "labeledOptionCount": 3,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 3
        }
      },
      {
        "order": 4,
        "itemNo": 4,
        "noktaId": "205",
        "itemId": "n205-klima-elektronigi",
        "title": "Klima Elektroniği",
        "moduleId": "obd-beyin",
        "moduleTitle": "OBD/BEYİN TEST",
        "statusOptions": [
          "Arıza Kaydı Yok",
          "Arıza Kaydı Mevcut",
          "Yok"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "Arıza Kaydı Yok",
            "label": "Arıza Kaydı Yok",
            "displayLabel": "Arıza Kaydı Yok",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Arıza Kaydı Yok"
          },
          {
            "optionType": "label",
            "value": "Arıza Kaydı Mevcut",
            "label": "Arıza Kaydı Mevcut",
            "displayLabel": "Arıza Kaydı Mevcut",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Arıza Kaydı Mevcut"
          },
          {
            "optionType": "label",
            "value": "Yok",
            "label": "Yok",
            "displayLabel": "Yok",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Yok"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 3,
        "labeledOptionCount": 3,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 3
        }
      },
      {
        "order": 5,
        "itemNo": 5,
        "noktaId": "212",
        "itemId": "n212-lastik-basinc-elektronigi",
        "title": "Lastik Basınç Elektroniği",
        "moduleId": "obd-beyin",
        "moduleTitle": "OBD/BEYİN TEST",
        "statusOptions": [
          "Arıza Kaydı Yok",
          "Arıza Kaydı Mevcut",
          "Yok"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "Arıza Kaydı Yok",
            "label": "Arıza Kaydı Yok",
            "displayLabel": "Arıza Kaydı Yok",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Arıza Kaydı Yok"
          },
          {
            "optionType": "label",
            "value": "Arıza Kaydı Mevcut",
            "label": "Arıza Kaydı Mevcut",
            "displayLabel": "Arıza Kaydı Mevcut",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Arıza Kaydı Mevcut"
          },
          {
            "optionType": "label",
            "value": "Yok",
            "label": "Yok",
            "displayLabel": "Yok",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Yok"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 3,
        "labeledOptionCount": 3,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 3
        }
      },
      {
        "order": 6,
        "itemNo": 6,
        "noktaId": "210",
        "itemId": "n210-elektrikli-direksiyon",
        "title": "Elektrikli Direksiyon",
        "moduleId": "obd-beyin",
        "moduleTitle": "OBD/BEYİN TEST",
        "statusOptions": [
          "Arıza Kaydı Yok",
          "Arıza Kaydı Mevcut",
          "Yok"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "Arıza Kaydı Yok",
            "label": "Arıza Kaydı Yok",
            "displayLabel": "Arıza Kaydı Yok",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Arıza Kaydı Yok"
          },
          {
            "optionType": "label",
            "value": "Arıza Kaydı Mevcut",
            "label": "Arıza Kaydı Mevcut",
            "displayLabel": "Arıza Kaydı Mevcut",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Arıza Kaydı Mevcut"
          },
          {
            "optionType": "label",
            "value": "Yok",
            "label": "Yok",
            "displayLabel": "Yok",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Yok"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 3,
        "labeledOptionCount": 3,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 3
        }
      },
      {
        "order": 7,
        "itemNo": 7,
        "noktaId": "483",
        "itemId": "n483-govde-elektronik-arizasi-mevcut-mu",
        "title": "Gövde Elektronik Arızası Mevcut mu?",
        "moduleId": "obd-beyin",
        "moduleTitle": "OBD/BEYİN TEST",
        "statusOptions": [
          "Hayır",
          "Evet",
          "Mevcut Değil"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "Hayır",
            "label": "Hayır",
            "displayLabel": "Hayır",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Hayır"
          },
          {
            "optionType": "label",
            "value": "Evet",
            "label": "Evet",
            "displayLabel": "Evet",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Evet"
          },
          {
            "optionType": "label",
            "value": "Mevcut Değil",
            "label": "Mevcut Değil",
            "displayLabel": "Mevcut Değil",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Mevcut Değil"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 3,
        "labeledOptionCount": 3,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 1
        }
      },
      {
        "order": 8,
        "itemNo": 8,
        "noktaId": "282",
        "itemId": "n282-motor-beyin-elektroniginde-ariza-kaydi-var-mi",
        "title": "Motor Beyin Elektroniğinde Arıza Kaydı Var mı?",
        "moduleId": "obd-beyin",
        "moduleTitle": "OBD/BEYİN TEST",
        "statusOptions": [
          "Yok",
          "Var"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "Yok",
            "label": "Yok",
            "displayLabel": "Yok",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Yok"
          },
          {
            "optionType": "label",
            "value": "Var",
            "label": "Var",
            "displayLabel": "Var",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Var"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 2,
        "labeledOptionCount": 2,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 2
        }
      },
      {
        "order": 9,
        "itemNo": 9,
        "noktaId": "283",
        "itemId": "n283-sanziman-elektronigi",
        "title": "Şanzıman Elektroniği",
        "moduleId": "obd-beyin",
        "moduleTitle": "OBD/BEYİN TEST",
        "statusOptions": [
          "Arıza Kaydı Yok",
          "Arıza Kaydı Mevcut",
          "Yok"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "Arıza Kaydı Yok",
            "label": "Arıza Kaydı Yok",
            "displayLabel": "Arıza Kaydı Yok",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Arıza Kaydı Yok"
          },
          {
            "optionType": "label",
            "value": "Arıza Kaydı Mevcut",
            "label": "Arıza Kaydı Mevcut",
            "displayLabel": "Arıza Kaydı Mevcut",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Arıza Kaydı Mevcut"
          },
          {
            "optionType": "label",
            "value": "Yok",
            "label": "Yok",
            "displayLabel": "Yok",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Yok"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 3,
        "labeledOptionCount": 3,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 3
        }
      },
      {
        "order": 10,
        "itemNo": 10,
        "noktaId": "1122",
        "itemId": "n1122-obd-test-ciktisi-gorseli",
        "title": "OBD Test Çıktısı Görseli",
        "moduleId": "obd-beyin",
        "moduleTitle": "OBD/BEYİN TEST",
        "statusOptions": [
          "OBD Test Çıktısı Görseli"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "OBD Test Çıktısı Görseli",
            "label": "OBD Test Çıktısı Görseli",
            "displayLabel": "OBD Test Çıktısı Görseli",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "OBD Test Çıktısı Görseli"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 1,
        "labeledOptionCount": 1,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": false,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 0
        }
      }
    ]
  },
  {
    "moduleNo": 6,
    "moduleId": "dyno-yol",
    "key": "dyno-yol",
    "title": "DYNO/ YOL TESTİ",
    "shortTitle": "Dyno / Yol",
    "groupTitle": "DYNO/ YOL TESTİ",
    "groupTitles": [
      "DYNO/ YOL TESTİ"
    ],
    "itemCount": 5,
    "items": [
      {
        "order": 1,
        "itemNo": 1,
        "noktaId": "172",
        "itemId": "n172-motor-guc-olcumu-kw-hp",
        "title": "Motor Güç Ölçümü (kW,hp)",
        "moduleId": "dyno-yol",
        "moduleTitle": "DYNO/ YOL TESTİ",
        "statusOptions": [
          "İyi",
          "Orta",
          "Kötü"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "İyi",
            "label": "İyi",
            "displayLabel": "İyi",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "İyi"
          },
          {
            "optionType": "label",
            "value": "Orta",
            "label": "Orta",
            "displayLabel": "Orta",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Orta"
          },
          {
            "optionType": "label",
            "value": "Kötü",
            "label": "Kötü",
            "displayLabel": "Kötü",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Kötü"
          }
        ],
        "inputs": [
          {
            "inputType": "number",
            "label": "Numeric bir değer girin",
            "name": "EkAlan",
            "sourceText": "number (Numeric bir değer girin) name=EkAlan"
          }
        ],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 3,
        "labeledOptionCount": 3,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 1
        }
      },
      {
        "order": 2,
        "itemNo": 2,
        "noktaId": "237",
        "itemId": "n237-motor-tork-olcumu-nm-kgm",
        "title": "Motor Tork Ölçümü (Nm, kgm)",
        "moduleId": "dyno-yol",
        "moduleTitle": "DYNO/ YOL TESTİ",
        "statusOptions": [
          "İyi",
          "Orta",
          "Kötü"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "İyi",
            "label": "İyi",
            "displayLabel": "İyi",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "İyi"
          },
          {
            "optionType": "label",
            "value": "Orta",
            "label": "Orta",
            "displayLabel": "Orta",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Orta"
          },
          {
            "optionType": "label",
            "value": "Kötü",
            "label": "Kötü",
            "displayLabel": "Kötü",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Kötü"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 3,
        "labeledOptionCount": 3,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 1
        }
      },
      {
        "order": 3,
        "itemNo": 3,
        "noktaId": "303",
        "itemId": "n303-ivmelenme-kontrolu",
        "title": "İvmelenme Kontrolü",
        "moduleId": "dyno-yol",
        "moduleTitle": "DYNO/ YOL TESTİ",
        "statusOptions": [
          "Sorunsuz",
          "İvmelenme ve Gaza Tepki Düşük"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "Sorunsuz",
            "label": "Sorunsuz",
            "displayLabel": "Sorunsuz",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Sorunsuz"
          },
          {
            "optionType": "label",
            "value": "İvmelenme ve Gaza Tepki Düşük",
            "label": "İvmelenme ve Gaza Tepki Düşük",
            "displayLabel": "İvmelenme ve Gaza Tepki Düşük",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "İvmelenme ve Gaza Tepki Düşük"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 2,
        "labeledOptionCount": 2,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": false,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 0
        }
      },
      {
        "order": 4,
        "itemNo": 4,
        "noktaId": "302",
        "itemId": "n302-vites-gecisleri-kontrolu",
        "title": "Vites Geçişleri Kontrolü",
        "moduleId": "dyno-yol",
        "moduleTitle": "DYNO/ YOL TESTİ",
        "statusOptions": [
          "Vites Geçişleri Sorunsuz",
          "Vites Geçişlerinde Vuruntu ve Zorlanma Mevcut"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "Vites Geçişleri Sorunsuz",
            "label": "Vites Geçişleri Sorunsuz",
            "displayLabel": "Vites Geçişleri Sorunsuz",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Vites Geçişleri Sorunsuz"
          },
          {
            "optionType": "label",
            "value": "Vites Geçişlerinde Vuruntu ve Zorlanma Mevcut",
            "label": "Vites Geçişlerinde Vuruntu ve Zorlanma Mevcut",
            "displayLabel": "Vites Geçişlerinde Vuruntu ve Zorlanma Mevcut",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Vites Geçişlerinde Vuruntu ve Zorlanma Mevcut"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 2,
        "labeledOptionCount": 2,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": false,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 0
        }
      },
      {
        "order": 5,
        "itemNo": 5,
        "noktaId": "305",
        "itemId": "n305-araca-ait-anlik-dinamometre-olcum-ciktisi",
        "title": "Araca Ait Anlık Dinamometre Ölçüm Çıktısı",
        "moduleId": "dyno-yol",
        "moduleTitle": "DYNO/ YOL TESTİ",
        "statusOptions": [
          "Dyno Testi Yapıldı",
          "Yol Testi Yapıldı"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "Dyno Testi Yapıldı",
            "label": "Dyno Testi Yapıldı",
            "displayLabel": "Dyno Testi Yapıldı",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Dyno Testi Yapıldı"
          },
          {
            "optionType": "label",
            "value": "Yol Testi Yapıldı",
            "label": "Yol Testi Yapıldı",
            "displayLabel": "Yol Testi Yapıldı",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Yol Testi Yapıldı"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 2,
        "labeledOptionCount": 2,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": false,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 0
        }
      }
    ]
  },
  {
    "moduleNo": 7,
    "moduleId": "genel-kondisyon-dis",
    "key": "genel-kondisyon-dis",
    "title": "GENEL KONDİSYON / DIŞ EKSPERTİZ VE CHECK-UP",
    "shortTitle": "Dış Kondisyon",
    "groupTitle": "GENEL KONDİSYON / DIŞ EKSPERTİZ VE CHECK-UP",
    "groupTitles": [
      "GENEL KONDİSYON / DIŞ EKSPERTİZ VE CHECK-UP"
    ],
    "itemCount": 35,
    "items": [
      {
        "order": 1,
        "itemNo": 1,
        "noktaId": "321",
        "itemId": "n321-aracta-ezik-cizik-gocuk-mevcut-mu",
        "title": "Araçta Ezik-Çizik-Göçük Mevcut mu?",
        "moduleId": "genel-kondisyon-dis",
        "moduleTitle": "GENEL KONDİSYON / DIŞ EKSPERTİZ VE CHECK-UP",
        "statusOptions": [
          "Hayır",
          "Evet"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "Hayır",
            "label": "Hayır",
            "displayLabel": "Hayır",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Hayır"
          },
          {
            "optionType": "label",
            "value": "Evet",
            "label": "Evet",
            "displayLabel": "Evet",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Evet"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 2,
        "labeledOptionCount": 2,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 1
        }
      },
      {
        "order": 2,
        "itemNo": 2,
        "noktaId": "186",
        "itemId": "n186-sol-on-lastik-yili",
        "title": "Sol Ön Lastik Yılı",
        "moduleId": "genel-kondisyon-dis",
        "moduleTitle": "GENEL KONDİSYON / DIŞ EKSPERTİZ VE CHECK-UP",
        "statusOptions": [
          "İyi",
          "Orta",
          "Kötü",
          "Kar Lastiği Mevcut"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "İyi",
            "label": "İyi",
            "displayLabel": "İyi",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "İyi"
          },
          {
            "optionType": "label",
            "value": "Orta",
            "label": "Orta",
            "displayLabel": "Orta",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Orta"
          },
          {
            "optionType": "label",
            "value": "Kötü",
            "label": "Kötü",
            "displayLabel": "Kötü",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Kötü"
          },
          {
            "optionType": "label",
            "value": "Kar Lastiği Mevcut",
            "label": "Kar Lastiği Mevcut",
            "displayLabel": "Kar Lastiği Mevcut",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Kar Lastiği Mevcut"
          }
        ],
        "inputs": [
          {
            "inputType": "text",
            "label": "Lastik Yılı",
            "name": "EkAlan",
            "sourceText": "text (Lastik Yılı) name=EkAlan"
          }
        ],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 4,
        "labeledOptionCount": 4,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 1
        }
      },
      {
        "order": 3,
        "itemNo": 3,
        "noktaId": "32",
        "itemId": "n32-sol-on-lastik-dis-derinligi-mm",
        "title": "Sol Ön Lastik Diş Derinliği (mm)",
        "moduleId": "genel-kondisyon-dis",
        "moduleTitle": "GENEL KONDİSYON / DIŞ EKSPERTİZ VE CHECK-UP",
        "statusOptions": [
          "İyi",
          "Orta",
          "Kötü",
          "Arazi Tipi Lastik Mevcut"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "İyi",
            "label": "İyi",
            "displayLabel": "İyi",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "İyi"
          },
          {
            "optionType": "label",
            "value": "Orta",
            "label": "Orta",
            "displayLabel": "Orta",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Orta"
          },
          {
            "optionType": "label",
            "value": "Kötü",
            "label": "Kötü",
            "displayLabel": "Kötü",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Kötü"
          },
          {
            "optionType": "label",
            "value": "Arazi Tipi Lastik Mevcut",
            "label": "Arazi Tipi Lastik Mevcut",
            "displayLabel": "Arazi Tipi Lastik Mevcut",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Arazi Tipi Lastik Mevcut"
          }
        ],
        "inputs": [
          {
            "inputType": "text",
            "label": "Lastik Derinliği",
            "name": "EkAlan",
            "sourceText": "text (Lastik Derinliği) name=EkAlan"
          }
        ],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 4,
        "labeledOptionCount": 4,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 1
        }
      },
      {
        "order": 4,
        "itemNo": 4,
        "noktaId": "167",
        "itemId": "n167-sol-arka-lastik-yili",
        "title": "Sol Arka Lastik Yılı",
        "moduleId": "genel-kondisyon-dis",
        "moduleTitle": "GENEL KONDİSYON / DIŞ EKSPERTİZ VE CHECK-UP",
        "statusOptions": [
          "İyi",
          "Orta",
          "Kötü",
          "Kar Lastiği Mevcut"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "İyi",
            "label": "İyi",
            "displayLabel": "İyi",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "İyi"
          },
          {
            "optionType": "label",
            "value": "Orta",
            "label": "Orta",
            "displayLabel": "Orta",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Orta"
          },
          {
            "optionType": "label",
            "value": "Kötü",
            "label": "Kötü",
            "displayLabel": "Kötü",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Kötü"
          },
          {
            "optionType": "label",
            "value": "Kar Lastiği Mevcut",
            "label": "Kar Lastiği Mevcut",
            "displayLabel": "Kar Lastiği Mevcut",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Kar Lastiği Mevcut"
          }
        ],
        "inputs": [
          {
            "inputType": "text",
            "label": "Lastik Yılı",
            "name": "EkAlan",
            "sourceText": "text (Lastik Yılı) name=EkAlan"
          }
        ],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 4,
        "labeledOptionCount": 4,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 1
        }
      },
      {
        "order": 5,
        "itemNo": 5,
        "noktaId": "41",
        "itemId": "n41-sol-arka-lastik-dis-derinligi",
        "title": "Sol Arka Lastik Diş Derinliği",
        "moduleId": "genel-kondisyon-dis",
        "moduleTitle": "GENEL KONDİSYON / DIŞ EKSPERTİZ VE CHECK-UP",
        "statusOptions": [
          "İyi",
          "Orta",
          "Kötü",
          "Arazi Tipi Lastik Mevcut"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "İyi",
            "label": "İyi",
            "displayLabel": "İyi",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "İyi"
          },
          {
            "optionType": "label",
            "value": "Orta",
            "label": "Orta",
            "displayLabel": "Orta",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Orta"
          },
          {
            "optionType": "label",
            "value": "Kötü",
            "label": "Kötü",
            "displayLabel": "Kötü",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Kötü"
          },
          {
            "optionType": "label",
            "value": "Arazi Tipi Lastik Mevcut",
            "label": "Arazi Tipi Lastik Mevcut",
            "displayLabel": "Arazi Tipi Lastik Mevcut",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Arazi Tipi Lastik Mevcut"
          }
        ],
        "inputs": [
          {
            "inputType": "text",
            "label": "Lastik Derinliği",
            "name": "EkAlan",
            "sourceText": "text (Lastik Derinliği) name=EkAlan"
          }
        ],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 4,
        "labeledOptionCount": 4,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 1
        }
      },
      {
        "order": 6,
        "itemNo": 6,
        "noktaId": "168",
        "itemId": "n168-sag-arka-lastik-yili",
        "title": "Sağ Arka Lastik Yılı",
        "moduleId": "genel-kondisyon-dis",
        "moduleTitle": "GENEL KONDİSYON / DIŞ EKSPERTİZ VE CHECK-UP",
        "statusOptions": [
          "İyi",
          "Orta",
          "Kötü",
          "Kar Lastiği Mevcut"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "İyi",
            "label": "İyi",
            "displayLabel": "İyi",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "İyi"
          },
          {
            "optionType": "label",
            "value": "Orta",
            "label": "Orta",
            "displayLabel": "Orta",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Orta"
          },
          {
            "optionType": "label",
            "value": "Kötü",
            "label": "Kötü",
            "displayLabel": "Kötü",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Kötü"
          },
          {
            "optionType": "label",
            "value": "Kar Lastiği Mevcut",
            "label": "Kar Lastiği Mevcut",
            "displayLabel": "Kar Lastiği Mevcut",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Kar Lastiği Mevcut"
          }
        ],
        "inputs": [
          {
            "inputType": "text",
            "label": "Lastik Yılı",
            "name": "EkAlan",
            "sourceText": "text (Lastik Yılı) name=EkAlan"
          }
        ],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 4,
        "labeledOptionCount": 4,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 1
        }
      },
      {
        "order": 7,
        "itemNo": 7,
        "noktaId": "169",
        "itemId": "n169-sag-arka-lastik-derinligi",
        "title": "Sağ Arka Lastik Derinliği",
        "moduleId": "genel-kondisyon-dis",
        "moduleTitle": "GENEL KONDİSYON / DIŞ EKSPERTİZ VE CHECK-UP",
        "statusOptions": [
          "İyi",
          "Orta",
          "Kötü",
          "Arazi Tipi Lastik Mevcut"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "İyi",
            "label": "İyi",
            "displayLabel": "İyi",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "İyi"
          },
          {
            "optionType": "label",
            "value": "Orta",
            "label": "Orta",
            "displayLabel": "Orta",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Orta"
          },
          {
            "optionType": "label",
            "value": "Kötü",
            "label": "Kötü",
            "displayLabel": "Kötü",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Kötü"
          },
          {
            "optionType": "label",
            "value": "Arazi Tipi Lastik Mevcut",
            "label": "Arazi Tipi Lastik Mevcut",
            "displayLabel": "Arazi Tipi Lastik Mevcut",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Arazi Tipi Lastik Mevcut"
          }
        ],
        "inputs": [
          {
            "inputType": "text",
            "label": "Lastik Derinliği",
            "name": "EkAlan",
            "sourceText": "text (Lastik Derinliği) name=EkAlan"
          }
        ],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 4,
        "labeledOptionCount": 4,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 1
        }
      },
      {
        "order": 8,
        "itemNo": 8,
        "noktaId": "57",
        "itemId": "n57-sag-on-lastik-yili",
        "title": "Sağ Ön Lastik Yılı",
        "moduleId": "genel-kondisyon-dis",
        "moduleTitle": "GENEL KONDİSYON / DIŞ EKSPERTİZ VE CHECK-UP",
        "statusOptions": [
          "İyi",
          "Orta",
          "Kötü",
          "Kar Lastiği Mevcut"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "İyi",
            "label": "İyi",
            "displayLabel": "İyi",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "İyi"
          },
          {
            "optionType": "label",
            "value": "Orta",
            "label": "Orta",
            "displayLabel": "Orta",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Orta"
          },
          {
            "optionType": "label",
            "value": "Kötü",
            "label": "Kötü",
            "displayLabel": "Kötü",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Kötü"
          },
          {
            "optionType": "label",
            "value": "Kar Lastiği Mevcut",
            "label": "Kar Lastiği Mevcut",
            "displayLabel": "Kar Lastiği Mevcut",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Kar Lastiği Mevcut"
          }
        ],
        "inputs": [
          {
            "inputType": "text",
            "label": "Lastik Yılı",
            "name": "EkAlan",
            "sourceText": "text (Lastik Yılı) name=EkAlan"
          }
        ],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 4,
        "labeledOptionCount": 4,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 1
        }
      },
      {
        "order": 9,
        "itemNo": 9,
        "noktaId": "170",
        "itemId": "n170-sag-on-lastik-derinligi",
        "title": "Sağ Ön Lastik Derinliği",
        "moduleId": "genel-kondisyon-dis",
        "moduleTitle": "GENEL KONDİSYON / DIŞ EKSPERTİZ VE CHECK-UP",
        "statusOptions": [
          "İyi",
          "Orta",
          "Kötü",
          "Arazi Tipi Lastik Mevcut"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "İyi",
            "label": "İyi",
            "displayLabel": "İyi",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "İyi"
          },
          {
            "optionType": "label",
            "value": "Orta",
            "label": "Orta",
            "displayLabel": "Orta",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Orta"
          },
          {
            "optionType": "label",
            "value": "Kötü",
            "label": "Kötü",
            "displayLabel": "Kötü",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Kötü"
          },
          {
            "optionType": "label",
            "value": "Arazi Tipi Lastik Mevcut",
            "label": "Arazi Tipi Lastik Mevcut",
            "displayLabel": "Arazi Tipi Lastik Mevcut",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Arazi Tipi Lastik Mevcut"
          }
        ],
        "inputs": [
          {
            "inputType": "text",
            "label": "Lastik Derinliği",
            "name": "EkAlan",
            "sourceText": "text (Lastik Derinliği) name=EkAlan"
          }
        ],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 4,
        "labeledOptionCount": 4,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 1
        }
      },
      {
        "order": 10,
        "itemNo": 10,
        "noktaId": "54",
        "itemId": "n54-sol-ayna",
        "title": "Sol Ayna",
        "moduleId": "genel-kondisyon-dis",
        "moduleTitle": "GENEL KONDİSYON / DIŞ EKSPERTİZ VE CHECK-UP",
        "statusOptions": [
          "Çalışıyor",
          "Deforme",
          "Çalışmıyor",
          "Tamirli"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "Çalışıyor",
            "label": "Çalışıyor",
            "displayLabel": "Çalışıyor",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Çalışıyor"
          },
          {
            "optionType": "label",
            "value": "Deforme",
            "label": "Deforme",
            "displayLabel": "Deforme",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Deforme"
          },
          {
            "optionType": "label",
            "value": "Çalışmıyor",
            "label": "Çalışmıyor",
            "displayLabel": "Çalışmıyor",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Çalışmıyor"
          },
          {
            "optionType": "label",
            "value": "Tamirli",
            "label": "Tamirli",
            "displayLabel": "Tamirli",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Tamirli"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 4,
        "labeledOptionCount": 4,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 2
        }
      },
      {
        "order": 11,
        "itemNo": 11,
        "noktaId": "34",
        "itemId": "n34-on-sol-far",
        "title": "Ön Sol Far",
        "moduleId": "genel-kondisyon-dis",
        "moduleTitle": "GENEL KONDİSYON / DIŞ EKSPERTİZ VE CHECK-UP",
        "statusOptions": [],
        "options": [
          {
            "optionType": "checkbox",
            "value": "1250",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1250"
          },
          {
            "optionType": "checkbox",
            "value": "1251",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1251"
          },
          {
            "optionType": "checkbox",
            "value": "1596",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1596"
          },
          {
            "optionType": "checkbox",
            "value": "7291",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=7291"
          },
          {
            "optionType": "checkbox",
            "value": "8619",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=8619"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 5,
        "labeledOptionCount": 0,
        "placeholderOptionCount": 5,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": true,
          "criticalOptionCountHeuristic": 0
        }
      },
      {
        "order": 12,
        "itemNo": 12,
        "noktaId": "38",
        "itemId": "n38-arka-sol-stop",
        "title": "Arka Sol Stop",
        "moduleId": "genel-kondisyon-dis",
        "moduleTitle": "GENEL KONDİSYON / DIŞ EKSPERTİZ VE CHECK-UP",
        "statusOptions": [
          "Çalışıyor",
          "Çalışmıyor",
          "Hasarlı",
          "Tamirli",
          "Su Almış/Buhar Yapmış"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "Çalışıyor",
            "label": "Çalışıyor",
            "displayLabel": "Çalışıyor",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Çalışıyor"
          },
          {
            "optionType": "label",
            "value": "Çalışmıyor",
            "label": "Çalışmıyor",
            "displayLabel": "Çalışmıyor",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Çalışmıyor"
          },
          {
            "optionType": "label",
            "value": "Hasarlı",
            "label": "Hasarlı",
            "displayLabel": "Hasarlı",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Hasarlı"
          },
          {
            "optionType": "label",
            "value": "Tamirli",
            "label": "Tamirli",
            "displayLabel": "Tamirli",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Tamirli"
          },
          {
            "optionType": "label",
            "value": "Su Almış/Buhar Yapmış",
            "label": "Su Almış/Buhar Yapmış",
            "displayLabel": "Su Almış/Buhar Yapmış",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Su Almış/Buhar Yapmış"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 5,
        "labeledOptionCount": 5,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 2
        }
      },
      {
        "order": 13,
        "itemNo": 13,
        "noktaId": "55",
        "itemId": "n55-sol-kapi-kollari",
        "title": "Sol Kapı Kolları",
        "moduleId": "genel-kondisyon-dis",
        "moduleTitle": "GENEL KONDİSYON / DIŞ EKSPERTİZ VE CHECK-UP",
        "statusOptions": [
          "Çalışıyor",
          "Çalışmıyor"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "Çalışıyor",
            "label": "Çalışıyor",
            "displayLabel": "Çalışıyor",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Çalışıyor"
          },
          {
            "optionType": "label",
            "value": "Çalışmıyor",
            "label": "Çalışmıyor",
            "displayLabel": "Çalışmıyor",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Çalışmıyor"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 2,
        "labeledOptionCount": 2,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 1
        }
      },
      {
        "order": 14,
        "itemNo": 14,
        "noktaId": "35",
        "itemId": "n35-on-sol-sinyal",
        "title": "Ön Sol Sinyal",
        "moduleId": "genel-kondisyon-dis",
        "moduleTitle": "GENEL KONDİSYON / DIŞ EKSPERTİZ VE CHECK-UP",
        "statusOptions": [
          "Çalışıyor",
          "Çalışmıyor"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "Çalışıyor",
            "label": "Çalışıyor",
            "displayLabel": "Çalışıyor",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Çalışıyor"
          },
          {
            "optionType": "label",
            "value": "Çalışmıyor",
            "label": "Çalışmıyor",
            "displayLabel": "Çalışmıyor",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Çalışmıyor"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 2,
        "labeledOptionCount": 2,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 1
        }
      },
      {
        "order": 15,
        "itemNo": 15,
        "noktaId": "52",
        "itemId": "n52-on-sag-far",
        "title": "Ön Sağ Far",
        "moduleId": "genel-kondisyon-dis",
        "moduleTitle": "GENEL KONDİSYON / DIŞ EKSPERTİZ VE CHECK-UP",
        "statusOptions": [],
        "options": [
          {
            "optionType": "checkbox",
            "value": "786",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=786"
          },
          {
            "optionType": "checkbox",
            "value": "862",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=862"
          },
          {
            "optionType": "checkbox",
            "value": "1597",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1597"
          },
          {
            "optionType": "checkbox",
            "value": "7292",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=7292"
          },
          {
            "optionType": "checkbox",
            "value": "8620",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=8620"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 5,
        "labeledOptionCount": 0,
        "placeholderOptionCount": 5,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": true,
          "criticalOptionCountHeuristic": 0
        }
      },
      {
        "order": 16,
        "itemNo": 16,
        "noktaId": "37",
        "itemId": "n37-arka-silecekler",
        "title": "Arka Silecekler",
        "moduleId": "genel-kondisyon-dis",
        "moduleTitle": "GENEL KONDİSYON / DIŞ EKSPERTİZ VE CHECK-UP",
        "statusOptions": [],
        "options": [
          {
            "optionType": "checkbox",
            "value": "771",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=771"
          },
          {
            "optionType": "checkbox",
            "value": "809",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=809"
          },
          {
            "optionType": "checkbox",
            "value": "1247",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1247"
          },
          {
            "optionType": "checkbox",
            "value": "1578",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1578"
          },
          {
            "optionType": "checkbox",
            "value": "1579",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1579"
          },
          {
            "optionType": "checkbox",
            "value": "1580",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1580"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 6,
        "labeledOptionCount": 0,
        "placeholderOptionCount": 6,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": true,
          "criticalOptionCountHeuristic": 0
        }
      },
      {
        "order": 17,
        "itemNo": 17,
        "noktaId": "39",
        "itemId": "n39-arka-3-stop",
        "title": "Arka 3. Stop",
        "moduleId": "genel-kondisyon-dis",
        "moduleTitle": "GENEL KONDİSYON / DIŞ EKSPERTİZ VE CHECK-UP",
        "statusOptions": [
          "Çalışıyor",
          "Çalışmıyor",
          "Yok",
          "Su Almış/Buhar Yapmış"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "Çalışıyor",
            "label": "Çalışıyor",
            "displayLabel": "Çalışıyor",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Çalışıyor"
          },
          {
            "optionType": "label",
            "value": "Çalışmıyor",
            "label": "Çalışmıyor",
            "displayLabel": "Çalışmıyor",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Çalışmıyor"
          },
          {
            "optionType": "label",
            "value": "Yok",
            "label": "Yok",
            "displayLabel": "Yok",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Yok"
          },
          {
            "optionType": "label",
            "value": "Su Almış/Buhar Yapmış",
            "label": "Su Almış/Buhar Yapmış",
            "displayLabel": "Su Almış/Buhar Yapmış",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Su Almış/Buhar Yapmış"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 4,
        "labeledOptionCount": 4,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 2
        }
      },
      {
        "order": 18,
        "itemNo": 18,
        "noktaId": "40",
        "itemId": "n40-dortlu-flasor",
        "title": "Dörtlü Flaşör",
        "moduleId": "genel-kondisyon-dis",
        "moduleTitle": "GENEL KONDİSYON / DIŞ EKSPERTİZ VE CHECK-UP",
        "statusOptions": [
          "Çalışıyor",
          "Çalışmıyor"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "Çalışıyor",
            "label": "Çalışıyor",
            "displayLabel": "Çalışıyor",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Çalışıyor"
          },
          {
            "optionType": "label",
            "value": "Çalışmıyor",
            "label": "Çalışmıyor",
            "displayLabel": "Çalışmıyor",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Çalışmıyor"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 2,
        "labeledOptionCount": 2,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 1
        }
      },
      {
        "order": 19,
        "itemNo": 19,
        "noktaId": "43",
        "itemId": "n43-bagaj-ici-genel-durum",
        "title": "Bagaj İçi Genel Durum",
        "moduleId": "genel-kondisyon-dis",
        "moduleTitle": "GENEL KONDİSYON / DIŞ EKSPERTİZ VE CHECK-UP",
        "statusOptions": [
          "İyi",
          "Orta",
          "Kötü"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "İyi",
            "label": "İyi",
            "displayLabel": "İyi",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "İyi"
          },
          {
            "optionType": "label",
            "value": "Orta",
            "label": "Orta",
            "displayLabel": "Orta",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Orta"
          },
          {
            "optionType": "label",
            "value": "Kötü",
            "label": "Kötü",
            "displayLabel": "Kötü",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Kötü"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 3,
        "labeledOptionCount": 3,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 1
        }
      },
      {
        "order": 20,
        "itemNo": 20,
        "noktaId": "45",
        "itemId": "n45-davlumbazlar",
        "title": "Davlumbazlar",
        "moduleId": "genel-kondisyon-dis",
        "moduleTitle": "GENEL KONDİSYON / DIŞ EKSPERTİZ VE CHECK-UP",
        "statusOptions": [
          "İyi",
          "Orta",
          "Kötü"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "İyi",
            "label": "İyi",
            "displayLabel": "İyi",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "İyi"
          },
          {
            "optionType": "label",
            "value": "Orta",
            "label": "Orta",
            "displayLabel": "Orta",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Orta"
          },
          {
            "optionType": "label",
            "value": "Kötü",
            "label": "Kötü",
            "displayLabel": "Kötü",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Kötü"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 3,
        "labeledOptionCount": 3,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 1
        }
      },
      {
        "order": 21,
        "itemNo": 21,
        "noktaId": "44",
        "itemId": "n44-avadanlik-ve-stepne",
        "title": "Avadanlık ve Stepne",
        "moduleId": "genel-kondisyon-dis",
        "moduleTitle": "GENEL KONDİSYON / DIŞ EKSPERTİZ VE CHECK-UP",
        "statusOptions": [
          "İyi",
          "Kötü",
          "Yok"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "İyi",
            "label": "İyi",
            "displayLabel": "İyi",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "İyi"
          },
          {
            "optionType": "label",
            "value": "Kötü",
            "label": "Kötü",
            "displayLabel": "Kötü",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Kötü"
          },
          {
            "optionType": "label",
            "value": "Yok",
            "label": "Yok",
            "displayLabel": "Yok",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Yok"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 3,
        "labeledOptionCount": 3,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 2
        }
      },
      {
        "order": 22,
        "itemNo": 22,
        "noktaId": "53",
        "itemId": "n53-on-sag-sinyal",
        "title": "Ön Sağ Sinyal",
        "moduleId": "genel-kondisyon-dis",
        "moduleTitle": "GENEL KONDİSYON / DIŞ EKSPERTİZ VE CHECK-UP",
        "statusOptions": [
          "Çalışıyor",
          "Çalışmıyor"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "Çalışıyor",
            "label": "Çalışıyor",
            "displayLabel": "Çalışıyor",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Çalışıyor"
          },
          {
            "optionType": "label",
            "value": "Çalışmıyor",
            "label": "Çalışmıyor",
            "displayLabel": "Çalışmıyor",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Çalışmıyor"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 2,
        "labeledOptionCount": 2,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 1
        }
      },
      {
        "order": 23,
        "itemNo": 23,
        "noktaId": "36",
        "itemId": "n36-on-sag-sol-sis",
        "title": "Ön Sağ / Sol Sis",
        "moduleId": "genel-kondisyon-dis",
        "moduleTitle": "GENEL KONDİSYON / DIŞ EKSPERTİZ VE CHECK-UP",
        "statusOptions": [
          "Çalışıyor",
          "Çalışmıyor",
          "Yok",
          "Tamirli"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "Çalışıyor",
            "label": "Çalışıyor",
            "displayLabel": "Çalışıyor",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Çalışıyor"
          },
          {
            "optionType": "label",
            "value": "Çalışmıyor",
            "label": "Çalışmıyor",
            "displayLabel": "Çalışmıyor",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Çalışmıyor"
          },
          {
            "optionType": "label",
            "value": "Yok",
            "label": "Yok",
            "displayLabel": "Yok",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Yok"
          },
          {
            "optionType": "label",
            "value": "Tamirli",
            "label": "Tamirli",
            "displayLabel": "Tamirli",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Tamirli"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 4,
        "labeledOptionCount": 4,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 2
        }
      },
      {
        "order": 24,
        "itemNo": 24,
        "noktaId": "49",
        "itemId": "n49-arka-sag-stop",
        "title": "Arka Sağ Stop",
        "moduleId": "genel-kondisyon-dis",
        "moduleTitle": "GENEL KONDİSYON / DIŞ EKSPERTİZ VE CHECK-UP",
        "statusOptions": [
          "Çalışıyor",
          "Çalışmıyor",
          "Hasarlı",
          "Tamirli",
          "Su Almış/Buhar Yapmış"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "Çalışıyor",
            "label": "Çalışıyor",
            "displayLabel": "Çalışıyor",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Çalışıyor"
          },
          {
            "optionType": "label",
            "value": "Çalışmıyor",
            "label": "Çalışmıyor",
            "displayLabel": "Çalışmıyor",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Çalışmıyor"
          },
          {
            "optionType": "label",
            "value": "Hasarlı",
            "label": "Hasarlı",
            "displayLabel": "Hasarlı",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Hasarlı"
          },
          {
            "optionType": "label",
            "value": "Tamirli",
            "label": "Tamirli",
            "displayLabel": "Tamirli",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Tamirli"
          },
          {
            "optionType": "label",
            "value": "Su Almış/Buhar Yapmış",
            "label": "Su Almış/Buhar Yapmış",
            "displayLabel": "Su Almış/Buhar Yapmış",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Su Almış/Buhar Yapmış"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 5,
        "labeledOptionCount": 5,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 2
        }
      },
      {
        "order": 25,
        "itemNo": 25,
        "noktaId": "51",
        "itemId": "n51-plaka-aydinlatma",
        "title": "Plaka Aydınlatma",
        "moduleId": "genel-kondisyon-dis",
        "moduleTitle": "GENEL KONDİSYON / DIŞ EKSPERTİZ VE CHECK-UP",
        "statusOptions": [
          "Çalışıyor",
          "Çalışmıyor"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "Çalışıyor",
            "label": "Çalışıyor",
            "displayLabel": "Çalışıyor",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Çalışıyor"
          },
          {
            "optionType": "label",
            "value": "Çalışmıyor",
            "label": "Çalışmıyor",
            "displayLabel": "Çalışmıyor",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Çalışmıyor"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 2,
        "labeledOptionCount": 2,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 1
        }
      },
      {
        "order": 26,
        "itemNo": 26,
        "noktaId": "56",
        "itemId": "n56-arka-sis-farlari",
        "title": "Arka Sis Farları",
        "moduleId": "genel-kondisyon-dis",
        "moduleTitle": "GENEL KONDİSYON / DIŞ EKSPERTİZ VE CHECK-UP",
        "statusOptions": [
          "Çalışıyor",
          "Çalışmıyor",
          "Tamirli"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "Çalışıyor",
            "label": "Çalışıyor",
            "displayLabel": "Çalışıyor",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Çalışıyor"
          },
          {
            "optionType": "label",
            "value": "Çalışmıyor",
            "label": "Çalışmıyor",
            "displayLabel": "Çalışmıyor",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Çalışmıyor"
          },
          {
            "optionType": "label",
            "value": "Tamirli",
            "label": "Tamirli",
            "displayLabel": "Tamirli",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Tamirli"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 3,
        "labeledOptionCount": 3,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 1
        }
      },
      {
        "order": 27,
        "itemNo": 27,
        "noktaId": "46",
        "itemId": "n46-sag-kapi-kollari",
        "title": "Sağ Kapı Kolları",
        "moduleId": "genel-kondisyon-dis",
        "moduleTitle": "GENEL KONDİSYON / DIŞ EKSPERTİZ VE CHECK-UP",
        "statusOptions": [
          "Çalışıyor",
          "Çalışmıyor"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "Çalışıyor",
            "label": "Çalışıyor",
            "displayLabel": "Çalışıyor",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Çalışıyor"
          },
          {
            "optionType": "label",
            "value": "Çalışmıyor",
            "label": "Çalışmıyor",
            "displayLabel": "Çalışmıyor",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Çalışmıyor"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 2,
        "labeledOptionCount": 2,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 1
        }
      },
      {
        "order": 28,
        "itemNo": 28,
        "noktaId": "47",
        "itemId": "n47-sag-ayna",
        "title": "Sağ Ayna",
        "moduleId": "genel-kondisyon-dis",
        "moduleTitle": "GENEL KONDİSYON / DIŞ EKSPERTİZ VE CHECK-UP",
        "statusOptions": [
          "Çalışıyor",
          "Deforme",
          "Çalışmıyor",
          "Tamirli"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "Çalışıyor",
            "label": "Çalışıyor",
            "displayLabel": "Çalışıyor",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Çalışıyor"
          },
          {
            "optionType": "label",
            "value": "Deforme",
            "label": "Deforme",
            "displayLabel": "Deforme",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Deforme"
          },
          {
            "optionType": "label",
            "value": "Çalışmıyor",
            "label": "Çalışmıyor",
            "displayLabel": "Çalışmıyor",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Çalışmıyor"
          },
          {
            "optionType": "label",
            "value": "Tamirli",
            "label": "Tamirli",
            "displayLabel": "Tamirli",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Tamirli"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 4,
        "labeledOptionCount": 4,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 2
        }
      },
      {
        "order": 29,
        "itemNo": 29,
        "noktaId": "50",
        "itemId": "n50-far-yikama",
        "title": "Far Yıkama",
        "moduleId": "genel-kondisyon-dis",
        "moduleTitle": "GENEL KONDİSYON / DIŞ EKSPERTİZ VE CHECK-UP",
        "statusOptions": [
          "Çalışıyor",
          "Çalışmıyor",
          "Yok"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "Çalışıyor",
            "label": "Çalışıyor",
            "displayLabel": "Çalışıyor",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Çalışıyor"
          },
          {
            "optionType": "label",
            "value": "Çalışmıyor",
            "label": "Çalışmıyor",
            "displayLabel": "Çalışmıyor",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Çalışmıyor"
          },
          {
            "optionType": "label",
            "value": "Yok",
            "label": "Yok",
            "displayLabel": "Yok",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Yok"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 3,
        "labeledOptionCount": 3,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 2
        }
      },
      {
        "order": 30,
        "itemNo": 30,
        "noktaId": "33",
        "itemId": "n33-on-silecekler",
        "title": "Ön Silecekler",
        "moduleId": "genel-kondisyon-dis",
        "moduleTitle": "GENEL KONDİSYON / DIŞ EKSPERTİZ VE CHECK-UP",
        "statusOptions": [],
        "options": [
          {
            "optionType": "checkbox",
            "value": "767",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=767"
          },
          {
            "optionType": "checkbox",
            "value": "805",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=805"
          },
          {
            "optionType": "checkbox",
            "value": "1577",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1577"
          },
          {
            "optionType": "checkbox",
            "value": "1576",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1576"
          },
          {
            "optionType": "checkbox",
            "value": "1575",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1575"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 5,
        "labeledOptionCount": 0,
        "placeholderOptionCount": 5,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": true,
          "criticalOptionCountHeuristic": 0
        }
      },
      {
        "order": 31,
        "itemNo": 31,
        "noktaId": "48",
        "itemId": "n48-jantlar",
        "title": "Jantlar",
        "moduleId": "genel-kondisyon-dis",
        "moduleTitle": "GENEL KONDİSYON / DIŞ EKSPERTİZ VE CHECK-UP",
        "statusOptions": [
          "İyi",
          "Deforme",
          "Kırık/Çatlak/Kaynak Mevcut"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "İyi",
            "label": "İyi",
            "displayLabel": "İyi",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "İyi"
          },
          {
            "optionType": "label",
            "value": "Deforme",
            "label": "Deforme",
            "displayLabel": "Deforme",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Deforme"
          },
          {
            "optionType": "label",
            "value": "Kırık/Çatlak/Kaynak Mevcut",
            "label": "Kırık/Çatlak/Kaynak Mevcut",
            "displayLabel": "Kırık/Çatlak/Kaynak Mevcut",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Kırık/Çatlak/Kaynak Mevcut"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 3,
        "labeledOptionCount": 3,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 2
        }
      },
      {
        "order": 32,
        "itemNo": 32,
        "noktaId": "297",
        "itemId": "n297-aracin-yasina-gore-yipranma-durumu",
        "title": "Aracın Yaşına Göre Yıpranma Durumu",
        "moduleId": "genel-kondisyon-dis",
        "moduleTitle": "GENEL KONDİSYON / DIŞ EKSPERTİZ VE CHECK-UP",
        "statusOptions": [
          "Araç Yıpranma Durumu Yaşına Göre Normal",
          "Araçta Aşırı Yıpranma Mevcut"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "Araç Yıpranma Durumu Yaşına Göre Normal",
            "label": "Araç Yıpranma Durumu Yaşına Göre Normal",
            "displayLabel": "Araç Yıpranma Durumu Yaşına Göre Normal",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Araç Yıpranma Durumu Yaşına Göre Normal"
          },
          {
            "optionType": "label",
            "value": "Araçta Aşırı Yıpranma Mevcut",
            "label": "Araçta Aşırı Yıpranma Mevcut",
            "displayLabel": "Araçta Aşırı Yıpranma Mevcut",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Araçta Aşırı Yıpranma Mevcut"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 2,
        "labeledOptionCount": 2,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": false,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 0
        }
      },
      {
        "order": 33,
        "itemNo": 33,
        "noktaId": "320",
        "itemId": "n320-arka-tampon-reflektor",
        "title": "Arka Tampon Reflektör",
        "moduleId": "genel-kondisyon-dis",
        "moduleTitle": "GENEL KONDİSYON / DIŞ EKSPERTİZ VE CHECK-UP",
        "statusOptions": [],
        "options": [
          {
            "optionType": "checkbox",
            "value": "1593",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1593"
          },
          {
            "optionType": "checkbox",
            "value": "1594",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1594"
          },
          {
            "optionType": "checkbox",
            "value": "1595",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1595"
          },
          {
            "optionType": "checkbox",
            "value": "8631",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=8631"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 4,
        "labeledOptionCount": 0,
        "placeholderOptionCount": 4,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": true,
          "criticalOptionCountHeuristic": 0
        }
      },
      {
        "order": 34,
        "itemNo": 34,
        "noktaId": "484",
        "itemId": "n484-geri-vites-lambalari",
        "title": "Geri Vites Lambaları",
        "moduleId": "genel-kondisyon-dis",
        "moduleTitle": "GENEL KONDİSYON / DIŞ EKSPERTİZ VE CHECK-UP",
        "statusOptions": [
          "Yanıyor",
          "Yanmıyor"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "Yanıyor",
            "label": "Yanıyor",
            "displayLabel": "Yanıyor",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Yanıyor"
          },
          {
            "optionType": "label",
            "value": "Yanmıyor",
            "label": "Yanmıyor",
            "displayLabel": "Yanmıyor",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Yanmıyor"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 2,
        "labeledOptionCount": 2,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 1
        }
      },
      {
        "order": 35,
        "itemNo": 35,
        "noktaId": "1259",
        "itemId": "n1259-merkezi-kilit-sistemi-uzaktan-kumandasi",
        "title": "Merkezi Kilit Sistemi Uzaktan Kumandası",
        "moduleId": "genel-kondisyon-dis",
        "moduleTitle": "GENEL KONDİSYON / DIŞ EKSPERTİZ VE CHECK-UP",
        "statusOptions": [
          "Çalışıyor",
          "Çalışmıyor",
          "Yok"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "Çalışıyor",
            "label": "Çalışıyor",
            "displayLabel": "Çalışıyor",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Çalışıyor"
          },
          {
            "optionType": "label",
            "value": "Çalışmıyor",
            "label": "Çalışmıyor",
            "displayLabel": "Çalışmıyor",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Çalışmıyor"
          },
          {
            "optionType": "label",
            "value": "Yok",
            "label": "Yok",
            "displayLabel": "Yok",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Yok"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 3,
        "labeledOptionCount": 3,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 2
        }
      }
    ]
  },
  {
    "moduleNo": 8,
    "moduleId": "ic-ekspertiz",
    "key": "ic-ekspertiz",
    "title": "İÇ EKSPERTİZ VE CHECK-UP",
    "shortTitle": "İç Ekspertiz",
    "groupTitle": "İÇ EKSPERTİZ VE CHECK-UP",
    "groupTitles": [
      "İÇ EKSPERTİZ VE CHECK-UP"
    ],
    "itemCount": 46,
    "items": [
      {
        "order": 1,
        "itemNo": 1,
        "noktaId": "318",
        "itemId": "n318-ariza-isik-veya-uyarisi-mevcut-mu",
        "title": "Arıza Işık veya Uyarısı Mevcut mu?",
        "moduleId": "ic-ekspertiz",
        "moduleTitle": "İÇ EKSPERTİZ VE CHECK-UP",
        "statusOptions": [
          "Evet",
          "Hayır"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "Evet",
            "label": "Evet",
            "displayLabel": "Evet",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Evet"
          },
          {
            "optionType": "label",
            "value": "Hayır",
            "label": "Hayır",
            "displayLabel": "Hayır",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Hayır"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 2,
        "labeledOptionCount": 2,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 1
        }
      },
      {
        "order": 2,
        "itemNo": 2,
        "noktaId": "154",
        "itemId": "n154-genel-torpido-kaplama",
        "title": "Genel Torpido Kaplama",
        "moduleId": "ic-ekspertiz",
        "moduleTitle": "İÇ EKSPERTİZ VE CHECK-UP",
        "statusOptions": [
          "İyi",
          "Orta",
          "Kötü",
          "Deforme",
          "Bakılamadı"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "İyi",
            "label": "İyi",
            "displayLabel": "İyi",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "İyi"
          },
          {
            "optionType": "label",
            "value": "Orta",
            "label": "Orta",
            "displayLabel": "Orta",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Orta"
          },
          {
            "optionType": "label",
            "value": "Kötü",
            "label": "Kötü",
            "displayLabel": "Kötü",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Kötü"
          },
          {
            "optionType": "label",
            "value": "Deforme",
            "label": "Deforme",
            "displayLabel": "Deforme",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Deforme"
          },
          {
            "optionType": "label",
            "value": "Bakılamadı",
            "label": "Bakılamadı",
            "displayLabel": "Bakılamadı",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Bakılamadı"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 5,
        "labeledOptionCount": 5,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 2
        }
      },
      {
        "order": 3,
        "itemNo": 3,
        "noktaId": "153",
        "itemId": "n153-radyo-ve-ses-sistemi",
        "title": "Radyo ve Ses Sistemi",
        "moduleId": "ic-ekspertiz",
        "moduleTitle": "İÇ EKSPERTİZ VE CHECK-UP",
        "statusOptions": [
          "Çalışıyor",
          "Çalışmıyor",
          "Bakılamadı"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "Çalışıyor",
            "label": "Çalışıyor",
            "displayLabel": "Çalışıyor",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Çalışıyor"
          },
          {
            "optionType": "label",
            "value": "Çalışmıyor",
            "label": "Çalışmıyor",
            "displayLabel": "Çalışmıyor",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Çalışmıyor"
          },
          {
            "optionType": "label",
            "value": "Bakılamadı",
            "label": "Bakılamadı",
            "displayLabel": "Bakılamadı",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Bakılamadı"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 3,
        "labeledOptionCount": 3,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 1
        }
      },
      {
        "order": 4,
        "itemNo": 4,
        "noktaId": "152",
        "itemId": "n152-klima-ve-izgaralar",
        "title": "Klima ve Izgaralar",
        "moduleId": "ic-ekspertiz",
        "moduleTitle": "İÇ EKSPERTİZ VE CHECK-UP",
        "statusOptions": [
          "İyi",
          "Orta",
          "Kötü",
          "Bakılamadı"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "İyi",
            "label": "İyi",
            "displayLabel": "İyi",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "İyi"
          },
          {
            "optionType": "label",
            "value": "Orta",
            "label": "Orta",
            "displayLabel": "Orta",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Orta"
          },
          {
            "optionType": "label",
            "value": "Kötü",
            "label": "Kötü",
            "displayLabel": "Kötü",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Kötü"
          },
          {
            "optionType": "label",
            "value": "Bakılamadı",
            "label": "Bakılamadı",
            "displayLabel": "Bakılamadı",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Bakılamadı"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 4,
        "labeledOptionCount": 4,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 1
        }
      },
      {
        "order": 5,
        "itemNo": 5,
        "noktaId": "162",
        "itemId": "n162-vites-kolu-bosluk-ve-yipranma",
        "title": "Vites Kolu Boşluk ve Yıpranma",
        "moduleId": "ic-ekspertiz",
        "moduleTitle": "İÇ EKSPERTİZ VE CHECK-UP",
        "statusOptions": [],
        "options": [
          {
            "optionType": "checkbox",
            "value": "303",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=303"
          },
          {
            "optionType": "checkbox",
            "value": "948",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=948"
          },
          {
            "optionType": "checkbox",
            "value": "587",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=587"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 3,
        "labeledOptionCount": 0,
        "placeholderOptionCount": 3,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": true,
          "criticalOptionCountHeuristic": 0
        }
      },
      {
        "order": 6,
        "itemNo": 6,
        "noktaId": "278",
        "itemId": "n278-arka-cam-rezistans-genel-durumu",
        "title": "Arka Cam Rezistans Genel Durumu",
        "moduleId": "ic-ekspertiz",
        "moduleTitle": "İÇ EKSPERTİZ VE CHECK-UP",
        "statusOptions": [
          "İyi",
          "Kötü"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "İyi",
            "label": "İyi",
            "displayLabel": "İyi",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "İyi"
          },
          {
            "optionType": "label",
            "value": "Kötü",
            "label": "Kötü",
            "displayLabel": "Kötü",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Kötü"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 2,
        "labeledOptionCount": 2,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 1
        }
      },
      {
        "order": 7,
        "itemNo": 7,
        "noktaId": "161",
        "itemId": "n161-bardaklik",
        "title": "Bardaklık",
        "moduleId": "ic-ekspertiz",
        "moduleTitle": "İÇ EKSPERTİZ VE CHECK-UP",
        "statusOptions": [],
        "options": [
          {
            "optionType": "checkbox",
            "value": "302",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=302"
          },
          {
            "optionType": "checkbox",
            "value": "350",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=350"
          },
          {
            "optionType": "checkbox",
            "value": "398",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=398"
          },
          {
            "optionType": "checkbox",
            "value": "947",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=947"
          },
          {
            "optionType": "checkbox",
            "value": "586",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=586"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 5,
        "labeledOptionCount": 0,
        "placeholderOptionCount": 5,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": true,
          "criticalOptionCountHeuristic": 0
        }
      },
      {
        "order": 8,
        "itemNo": 8,
        "noktaId": "160",
        "itemId": "n160-cakmak",
        "title": "Çakmak",
        "moduleId": "ic-ekspertiz",
        "moduleTitle": "İÇ EKSPERTİZ VE CHECK-UP",
        "statusOptions": [
          "Çalışıyor",
          "Çalışmıyor",
          "Yok"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "Çalışıyor",
            "label": "Çalışıyor",
            "displayLabel": "Çalışıyor",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Çalışıyor"
          },
          {
            "optionType": "label",
            "value": "Çalışmıyor",
            "label": "Çalışmıyor",
            "displayLabel": "Çalışmıyor",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Çalışmıyor"
          },
          {
            "optionType": "label",
            "value": "Yok",
            "label": "Yok",
            "displayLabel": "Yok",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Yok"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 3,
        "labeledOptionCount": 3,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 2
        }
      },
      {
        "order": 9,
        "itemNo": 9,
        "noktaId": "164",
        "itemId": "n164-el-fren-kolu-veya-dugmesi",
        "title": "El Fren Kolu veya Düğmesi",
        "moduleId": "ic-ekspertiz",
        "moduleTitle": "İÇ EKSPERTİZ VE CHECK-UP",
        "statusOptions": [
          "İyi",
          "Orta",
          "Kötü",
          "Servis Kontrol",
          "Bakılamadı"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "İyi",
            "label": "İyi",
            "displayLabel": "İyi",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "İyi"
          },
          {
            "optionType": "label",
            "value": "Orta",
            "label": "Orta",
            "displayLabel": "Orta",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Orta"
          },
          {
            "optionType": "label",
            "value": "Kötü",
            "label": "Kötü",
            "displayLabel": "Kötü",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Kötü"
          },
          {
            "optionType": "label",
            "value": "Servis Kontrol",
            "label": "Servis Kontrol",
            "displayLabel": "Servis Kontrol",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Servis Kontrol"
          },
          {
            "optionType": "label",
            "value": "Bakılamadı",
            "label": "Bakılamadı",
            "displayLabel": "Bakılamadı",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Bakılamadı"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 5,
        "labeledOptionCount": 5,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 2
        }
      },
      {
        "order": 10,
        "itemNo": 10,
        "noktaId": "133",
        "itemId": "n133-tavan-aydinlatmasi",
        "title": "Tavan Aydınlatması",
        "moduleId": "ic-ekspertiz",
        "moduleTitle": "İÇ EKSPERTİZ VE CHECK-UP",
        "statusOptions": [
          "Çalışıyor",
          "Çalışmıyor",
          "Bakılamadı"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "Çalışıyor",
            "label": "Çalışıyor",
            "displayLabel": "Çalışıyor",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Çalışıyor"
          },
          {
            "optionType": "label",
            "value": "Çalışmıyor",
            "label": "Çalışmıyor",
            "displayLabel": "Çalışmıyor",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Çalışmıyor"
          },
          {
            "optionType": "label",
            "value": "Bakılamadı",
            "label": "Bakılamadı",
            "displayLabel": "Bakılamadı",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Bakılamadı"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 3,
        "labeledOptionCount": 3,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 1
        }
      },
      {
        "order": 11,
        "itemNo": 11,
        "noktaId": "132",
        "itemId": "n132-tavan-dosemesi",
        "title": "Tavan Döşemesi",
        "moduleId": "ic-ekspertiz",
        "moduleTitle": "İÇ EKSPERTİZ VE CHECK-UP",
        "statusOptions": [
          "İyi",
          "Deforme"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "İyi",
            "label": "İyi",
            "displayLabel": "İyi",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "İyi"
          },
          {
            "optionType": "label",
            "value": "Deforme",
            "label": "Deforme",
            "displayLabel": "Deforme",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Deforme"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 2,
        "labeledOptionCount": 2,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 1
        }
      },
      {
        "order": 12,
        "itemNo": 12,
        "noktaId": "157",
        "itemId": "n157-sunroof-dugmesi",
        "title": "Sunroof Düğmesi",
        "moduleId": "ic-ekspertiz",
        "moduleTitle": "İÇ EKSPERTİZ VE CHECK-UP",
        "statusOptions": [
          "Çalışıyor",
          "Çalışmıyor",
          "Yok",
          "İyi",
          "Kırık-Çatlak Mevcut"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "Çalışıyor",
            "label": "Çalışıyor",
            "displayLabel": "Çalışıyor",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Çalışıyor"
          },
          {
            "optionType": "label",
            "value": "Çalışmıyor",
            "label": "Çalışmıyor",
            "displayLabel": "Çalışmıyor",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Çalışmıyor"
          },
          {
            "optionType": "label",
            "value": "Yok",
            "label": "Yok",
            "displayLabel": "Yok",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Yok"
          },
          {
            "optionType": "label",
            "value": "İyi",
            "label": "İyi",
            "displayLabel": "İyi",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "İyi"
          },
          {
            "optionType": "label",
            "value": "Kırık-Çatlak Mevcut",
            "label": "Kırık-Çatlak Mevcut",
            "displayLabel": "Kırık-Çatlak Mevcut",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Kırık-Çatlak Mevcut"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 5,
        "labeledOptionCount": 5,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 3
        }
      },
      {
        "order": 13,
        "itemNo": 13,
        "noktaId": "118",
        "itemId": "n118-korna",
        "title": "Korna",
        "moduleId": "ic-ekspertiz",
        "moduleTitle": "İÇ EKSPERTİZ VE CHECK-UP",
        "statusOptions": [
          "Çalışıyor",
          "Çalışmıyor"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "Çalışıyor",
            "label": "Çalışıyor",
            "displayLabel": "Çalışıyor",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Çalışıyor"
          },
          {
            "optionType": "label",
            "value": "Çalışmıyor",
            "label": "Çalışmıyor",
            "displayLabel": "Çalışmıyor",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Çalışmıyor"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 2,
        "labeledOptionCount": 2,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 1
        }
      },
      {
        "order": 14,
        "itemNo": 14,
        "noktaId": "123",
        "itemId": "n123-direksiyon-simidi-tuslari",
        "title": "Direksiyon Simidi Tuşları",
        "moduleId": "ic-ekspertiz",
        "moduleTitle": "İÇ EKSPERTİZ VE CHECK-UP",
        "statusOptions": [
          "Çalışıyor",
          "Çalışmıyor",
          "Yok"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "Çalışıyor",
            "label": "Çalışıyor",
            "displayLabel": "Çalışıyor",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Çalışıyor"
          },
          {
            "optionType": "label",
            "value": "Çalışmıyor",
            "label": "Çalışmıyor",
            "displayLabel": "Çalışmıyor",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Çalışmıyor"
          },
          {
            "optionType": "label",
            "value": "Yok",
            "label": "Yok",
            "displayLabel": "Yok",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Yok"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 3,
        "labeledOptionCount": 3,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 2
        }
      },
      {
        "order": 15,
        "itemNo": 15,
        "noktaId": "279",
        "itemId": "n279-guneslik-aydinlatmalari",
        "title": "Güneşlik Aydınlatmaları",
        "moduleId": "ic-ekspertiz",
        "moduleTitle": "İÇ EKSPERTİZ VE CHECK-UP",
        "statusOptions": [
          "Çalışıyor",
          "Çalışmıyor",
          "Yok"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "Çalışıyor",
            "label": "Çalışıyor",
            "displayLabel": "Çalışıyor",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Çalışıyor"
          },
          {
            "optionType": "label",
            "value": "Çalışmıyor",
            "label": "Çalışmıyor",
            "displayLabel": "Çalışmıyor",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Çalışmıyor"
          },
          {
            "optionType": "label",
            "value": "Yok",
            "label": "Yok",
            "displayLabel": "Yok",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Yok"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 3,
        "labeledOptionCount": 3,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 2
        }
      },
      {
        "order": 16,
        "itemNo": 16,
        "noktaId": "158",
        "itemId": "n158-sag-sol-on-guneslik",
        "title": "Sağ-Sol Ön - Güneşlik",
        "moduleId": "ic-ekspertiz",
        "moduleTitle": "İÇ EKSPERTİZ VE CHECK-UP",
        "statusOptions": [
          "İyi",
          "Çalışıyor",
          "Çalışmıyor",
          "Deforme",
          "Bakılamadı"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "İyi",
            "label": "İyi",
            "displayLabel": "İyi",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "İyi"
          },
          {
            "optionType": "label",
            "value": "Çalışıyor",
            "label": "Çalışıyor",
            "displayLabel": "Çalışıyor",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Çalışıyor"
          },
          {
            "optionType": "label",
            "value": "Çalışmıyor",
            "label": "Çalışmıyor",
            "displayLabel": "Çalışmıyor",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Çalışmıyor"
          },
          {
            "optionType": "label",
            "value": "Deforme",
            "label": "Deforme",
            "displayLabel": "Deforme",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Deforme"
          },
          {
            "optionType": "label",
            "value": "Bakılamadı",
            "label": "Bakılamadı",
            "displayLabel": "Bakılamadı",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Bakılamadı"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 5,
        "labeledOptionCount": 5,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 2
        }
      },
      {
        "order": 17,
        "itemNo": 17,
        "noktaId": "119",
        "itemId": "n119-ayna-motoru-ve-ayna-dugmeleri",
        "title": "Ayna Motoru ve Ayna Düğmeleri",
        "moduleId": "ic-ekspertiz",
        "moduleTitle": "İÇ EKSPERTİZ VE CHECK-UP",
        "statusOptions": [
          "Çalışıyor",
          "Çalışmıyor",
          "Yok"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "Çalışıyor",
            "label": "Çalışıyor",
            "displayLabel": "Çalışıyor",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Çalışıyor"
          },
          {
            "optionType": "label",
            "value": "Çalışmıyor",
            "label": "Çalışmıyor",
            "displayLabel": "Çalışmıyor",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Çalışmıyor"
          },
          {
            "optionType": "label",
            "value": "Yok",
            "label": "Yok",
            "displayLabel": "Yok",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Yok"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 3,
        "labeledOptionCount": 3,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 2
        }
      },
      {
        "order": 18,
        "itemNo": 18,
        "noktaId": "122",
        "itemId": "n122-pedal-lastikleri",
        "title": "Pedal Lastikleri",
        "moduleId": "ic-ekspertiz",
        "moduleTitle": "İÇ EKSPERTİZ VE CHECK-UP",
        "statusOptions": [
          "İyi",
          "Orta",
          "Kötü"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "İyi",
            "label": "İyi",
            "displayLabel": "İyi",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "İyi"
          },
          {
            "optionType": "label",
            "value": "Orta",
            "label": "Orta",
            "displayLabel": "Orta",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Orta"
          },
          {
            "optionType": "label",
            "value": "Kötü",
            "label": "Kötü",
            "displayLabel": "Kötü",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Kötü"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 3,
        "labeledOptionCount": 3,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 1
        }
      },
      {
        "order": 19,
        "itemNo": 19,
        "noktaId": "125",
        "itemId": "n125-silecek-far-ve-diger-kollar",
        "title": "Silecek Far ve Diğer Kollar",
        "moduleId": "ic-ekspertiz",
        "moduleTitle": "İÇ EKSPERTİZ VE CHECK-UP",
        "statusOptions": [
          "İyi",
          "Kötü",
          "Çalışmıyor"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "İyi",
            "label": "İyi",
            "displayLabel": "İyi",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "İyi"
          },
          {
            "optionType": "label",
            "value": "Kötü",
            "label": "Kötü",
            "displayLabel": "Kötü",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Kötü"
          },
          {
            "optionType": "label",
            "value": "Çalışmıyor",
            "label": "Çalışmıyor",
            "displayLabel": "Çalışmıyor",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Çalışmıyor"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 3,
        "labeledOptionCount": 3,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 2
        }
      },
      {
        "order": 20,
        "itemNo": 20,
        "noktaId": "130",
        "itemId": "n130-sol-on-cam-dugmeleri",
        "title": "Sol Ön - Cam Düğmeleri",
        "moduleId": "ic-ekspertiz",
        "moduleTitle": "İÇ EKSPERTİZ VE CHECK-UP",
        "statusOptions": [
          "Çalışıyor",
          "Çalışmıyor"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "Çalışıyor",
            "label": "Çalışıyor",
            "displayLabel": "Çalışıyor",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Çalışıyor"
          },
          {
            "optionType": "label",
            "value": "Çalışmıyor",
            "label": "Çalışmıyor",
            "displayLabel": "Çalışmıyor",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Çalışmıyor"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 2,
        "labeledOptionCount": 2,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 1
        }
      },
      {
        "order": 21,
        "itemNo": 21,
        "noktaId": "126",
        "itemId": "n126-sol-on-kapi-kilit-kollari-ve-doseme",
        "title": "Sol Ön - Kapı Kilit Kolları ve Döşeme",
        "moduleId": "ic-ekspertiz",
        "moduleTitle": "İÇ EKSPERTİZ VE CHECK-UP",
        "statusOptions": [
          "Deforme",
          "İyi",
          "Çalışmıyor",
          "Çalışıyor",
          "Bakılamadı"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "Deforme",
            "label": "Deforme",
            "displayLabel": "Deforme",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Deforme"
          },
          {
            "optionType": "label",
            "value": "İyi",
            "label": "İyi",
            "displayLabel": "İyi",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "İyi"
          },
          {
            "optionType": "label",
            "value": "Çalışmıyor",
            "label": "Çalışmıyor",
            "displayLabel": "Çalışmıyor",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Çalışmıyor"
          },
          {
            "optionType": "label",
            "value": "Çalışıyor",
            "label": "Çalışıyor",
            "displayLabel": "Çalışıyor",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Çalışıyor"
          },
          {
            "optionType": "label",
            "value": "Bakılamadı",
            "label": "Bakılamadı",
            "displayLabel": "Bakılamadı",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Bakılamadı"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 5,
        "labeledOptionCount": 5,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 2
        }
      },
      {
        "order": 22,
        "itemNo": 22,
        "noktaId": "127",
        "itemId": "n127-sol-on-elektrikli-koltuk",
        "title": "Sol Ön - Elektrikli Koltuk",
        "moduleId": "ic-ekspertiz",
        "moduleTitle": "İÇ EKSPERTİZ VE CHECK-UP",
        "statusOptions": [
          "Çalışıyor",
          "Çalışmıyor",
          "Yok"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "Çalışıyor",
            "label": "Çalışıyor",
            "displayLabel": "Çalışıyor",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Çalışıyor"
          },
          {
            "optionType": "label",
            "value": "Çalışmıyor",
            "label": "Çalışmıyor",
            "displayLabel": "Çalışmıyor",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Çalışmıyor"
          },
          {
            "optionType": "label",
            "value": "Yok",
            "label": "Yok",
            "displayLabel": "Yok",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Yok"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 3,
        "labeledOptionCount": 3,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 2
        }
      },
      {
        "order": 23,
        "itemNo": 23,
        "noktaId": "129",
        "itemId": "n129-sol-on-emniyet-kemeri",
        "title": "Sol Ön - Emniyet Kemeri",
        "moduleId": "ic-ekspertiz",
        "moduleTitle": "İÇ EKSPERTİZ VE CHECK-UP",
        "statusOptions": [
          "Çalışıyor",
          "Çalışmıyor"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "Çalışıyor",
            "label": "Çalışıyor",
            "displayLabel": "Çalışıyor",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Çalışıyor"
          },
          {
            "optionType": "label",
            "value": "Çalışmıyor",
            "label": "Çalışmıyor",
            "displayLabel": "Çalışmıyor",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Çalışmıyor"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 2,
        "labeledOptionCount": 2,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 1
        }
      },
      {
        "order": 24,
        "itemNo": 24,
        "noktaId": "131",
        "itemId": "n131-sol-on-yan-airbag-dosemeleri",
        "title": "Sol Ön - Yan Airbag Döşemeleri",
        "moduleId": "ic-ekspertiz",
        "moduleTitle": "İÇ EKSPERTİZ VE CHECK-UP",
        "statusOptions": [
          "İyi",
          "Deforme",
          "Kontrol Tavsiye",
          "Yok"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "İyi",
            "label": "İyi",
            "displayLabel": "İyi",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "İyi"
          },
          {
            "optionType": "label",
            "value": "Deforme",
            "label": "Deforme",
            "displayLabel": "Deforme",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Deforme"
          },
          {
            "optionType": "label",
            "value": "Kontrol Tavsiye",
            "label": "Kontrol Tavsiye",
            "displayLabel": "Kontrol Tavsiye",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Kontrol Tavsiye"
          },
          {
            "optionType": "label",
            "value": "Yok",
            "label": "Yok",
            "displayLabel": "Yok",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Yok"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 4,
        "labeledOptionCount": 4,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 2
        }
      },
      {
        "order": 25,
        "itemNo": 25,
        "noktaId": "128",
        "itemId": "n128-sol-on-koltuk-isitma",
        "title": "Sol Ön Koltuk Isıtma",
        "moduleId": "ic-ekspertiz",
        "moduleTitle": "İÇ EKSPERTİZ VE CHECK-UP",
        "statusOptions": [
          "Çalışıyor",
          "Çalışmıyor",
          "Yok"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "Çalışıyor",
            "label": "Çalışıyor",
            "displayLabel": "Çalışıyor",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Çalışıyor"
          },
          {
            "optionType": "label",
            "value": "Çalışmıyor",
            "label": "Çalışmıyor",
            "displayLabel": "Çalışmıyor",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Çalışmıyor"
          },
          {
            "optionType": "label",
            "value": "Yok",
            "label": "Yok",
            "displayLabel": "Yok",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Yok"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 3,
        "labeledOptionCount": 3,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 2
        }
      },
      {
        "order": 26,
        "itemNo": 26,
        "noktaId": "135",
        "itemId": "n135-sol-on-cam-dugmeleri-merkezi",
        "title": "Sol Ön - Cam Düğmeleri Merkezi",
        "moduleId": "ic-ekspertiz",
        "moduleTitle": "İÇ EKSPERTİZ VE CHECK-UP",
        "statusOptions": [
          "İyi",
          "Orta",
          "Kötü",
          "Bakılamadı"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "İyi",
            "label": "İyi",
            "displayLabel": "İyi",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "İyi"
          },
          {
            "optionType": "label",
            "value": "Orta",
            "label": "Orta",
            "displayLabel": "Orta",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Orta"
          },
          {
            "optionType": "label",
            "value": "Kötü",
            "label": "Kötü",
            "displayLabel": "Kötü",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Kötü"
          },
          {
            "optionType": "label",
            "value": "Bakılamadı",
            "label": "Bakılamadı",
            "displayLabel": "Bakılamadı",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Bakılamadı"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 4,
        "labeledOptionCount": 4,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 1
        }
      },
      {
        "order": 27,
        "itemNo": 27,
        "noktaId": "144",
        "itemId": "n144-on-ve-arka-koltuklar-doseme-kontrolu",
        "title": "Ön ve Arka Koltuklar Döşeme Kontrolü",
        "moduleId": "ic-ekspertiz",
        "moduleTitle": "İÇ EKSPERTİZ VE CHECK-UP",
        "statusOptions": [],
        "options": [
          {
            "optionType": "checkbox",
            "value": "285",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=285"
          },
          {
            "optionType": "checkbox",
            "value": "381",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=381"
          },
          {
            "optionType": "checkbox",
            "value": "1543",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1543"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 3,
        "labeledOptionCount": 0,
        "placeholderOptionCount": 3,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": true,
          "criticalOptionCountHeuristic": 0
        }
      },
      {
        "order": 28,
        "itemNo": 28,
        "noktaId": "142",
        "itemId": "n142-sag-sol-arka-cam-dugmeleri",
        "title": "Sağ-Sol Arka Cam Düğmeleri",
        "moduleId": "ic-ekspertiz",
        "moduleTitle": "İÇ EKSPERTİZ VE CHECK-UP",
        "statusOptions": [
          "Çalışıyor",
          "Çalışmıyor",
          "Yok"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "Çalışıyor",
            "label": "Çalışıyor",
            "displayLabel": "Çalışıyor",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Çalışıyor"
          },
          {
            "optionType": "label",
            "value": "Çalışmıyor",
            "label": "Çalışmıyor",
            "displayLabel": "Çalışmıyor",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Çalışmıyor"
          },
          {
            "optionType": "label",
            "value": "Yok",
            "label": "Yok",
            "displayLabel": "Yok",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Yok"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 3,
        "labeledOptionCount": 3,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 2
        }
      },
      {
        "order": 29,
        "itemNo": 29,
        "noktaId": "143",
        "itemId": "n143-sag-sol-arka-kapi-kilit-kollar-ve-doseme",
        "title": "Sağ-Sol Arka Kapı Kilit Kollar ve Döşeme",
        "moduleId": "ic-ekspertiz",
        "moduleTitle": "İÇ EKSPERTİZ VE CHECK-UP",
        "statusOptions": [],
        "options": [
          {
            "optionType": "checkbox",
            "value": "332",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=332"
          },
          {
            "optionType": "checkbox",
            "value": "284",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=284"
          },
          {
            "optionType": "checkbox",
            "value": "380",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=380"
          },
          {
            "optionType": "checkbox",
            "value": "1621",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1621"
          },
          {
            "optionType": "checkbox",
            "value": "7313",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=7313"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 5,
        "labeledOptionCount": 0,
        "placeholderOptionCount": 5,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": true,
          "criticalOptionCountHeuristic": 0
        }
      },
      {
        "order": 30,
        "itemNo": 30,
        "noktaId": "140",
        "itemId": "n140-arka-koltuk-ekranlar-kontrol",
        "title": "Arka Koltuk Ekranlar Kontrol",
        "moduleId": "ic-ekspertiz",
        "moduleTitle": "İÇ EKSPERTİZ VE CHECK-UP",
        "statusOptions": [
          "Çalışıyor",
          "Çalışmıyor",
          "Yok"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "Çalışıyor",
            "label": "Çalışıyor",
            "displayLabel": "Çalışıyor",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Çalışıyor"
          },
          {
            "optionType": "label",
            "value": "Çalışmıyor",
            "label": "Çalışmıyor",
            "displayLabel": "Çalışmıyor",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Çalışmıyor"
          },
          {
            "optionType": "label",
            "value": "Yok",
            "label": "Yok",
            "displayLabel": "Yok",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Yok"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 3,
        "labeledOptionCount": 3,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 2
        }
      },
      {
        "order": 31,
        "itemNo": 31,
        "noktaId": "139",
        "itemId": "n139-arka-koltuklar-isitma-ve-elektrik",
        "title": "Arka Koltuklar Isıtma ve Elektrik",
        "moduleId": "ic-ekspertiz",
        "moduleTitle": "İÇ EKSPERTİZ VE CHECK-UP",
        "statusOptions": [
          "Çalışıyor",
          "Çalışmıyor",
          "Yok"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "Çalışıyor",
            "label": "Çalışıyor",
            "displayLabel": "Çalışıyor",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Çalışıyor"
          },
          {
            "optionType": "label",
            "value": "Çalışmıyor",
            "label": "Çalışmıyor",
            "displayLabel": "Çalışmıyor",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Çalışmıyor"
          },
          {
            "optionType": "label",
            "value": "Yok",
            "label": "Yok",
            "displayLabel": "Yok",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Yok"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 3,
        "labeledOptionCount": 3,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 2
        }
      },
      {
        "order": 32,
        "itemNo": 32,
        "noktaId": "134",
        "itemId": "n134-arka-perdeler",
        "title": "Arka Perdeler",
        "moduleId": "ic-ekspertiz",
        "moduleTitle": "İÇ EKSPERTİZ VE CHECK-UP",
        "statusOptions": [
          "Çalışıyor",
          "Çalışmıyor",
          "Yok"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "Çalışıyor",
            "label": "Çalışıyor",
            "displayLabel": "Çalışıyor",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Çalışıyor"
          },
          {
            "optionType": "label",
            "value": "Çalışmıyor",
            "label": "Çalışmıyor",
            "displayLabel": "Çalışmıyor",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Çalışmıyor"
          },
          {
            "optionType": "label",
            "value": "Yok",
            "label": "Yok",
            "displayLabel": "Yok",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Yok"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 3,
        "labeledOptionCount": 3,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 2
        }
      },
      {
        "order": 33,
        "itemNo": 33,
        "noktaId": "145",
        "itemId": "n145-sag-sol-arka-emniyet-kemerleri",
        "title": "Sağ-Sol Arka - Emniyet Kemerleri",
        "moduleId": "ic-ekspertiz",
        "moduleTitle": "İÇ EKSPERTİZ VE CHECK-UP",
        "statusOptions": [
          "İyi",
          "Orta",
          "Kötü",
          "Bakılamadı"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "İyi",
            "label": "İyi",
            "displayLabel": "İyi",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "İyi"
          },
          {
            "optionType": "label",
            "value": "Orta",
            "label": "Orta",
            "displayLabel": "Orta",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Orta"
          },
          {
            "optionType": "label",
            "value": "Kötü",
            "label": "Kötü",
            "displayLabel": "Kötü",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Kötü"
          },
          {
            "optionType": "label",
            "value": "Bakılamadı",
            "label": "Bakılamadı",
            "displayLabel": "Bakılamadı",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Bakılamadı"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 4,
        "labeledOptionCount": 4,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 1
        }
      },
      {
        "order": 34,
        "itemNo": 34,
        "noktaId": "147",
        "itemId": "n147-sag-on-yan-airbag-dosemesi",
        "title": "Sağ Ön - Yan Airbag Döşemesi",
        "moduleId": "ic-ekspertiz",
        "moduleTitle": "İÇ EKSPERTİZ VE CHECK-UP",
        "statusOptions": [
          "İyi",
          "Deforme",
          "Kontrol Tavsiye",
          "Yok"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "İyi",
            "label": "İyi",
            "displayLabel": "İyi",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "İyi"
          },
          {
            "optionType": "label",
            "value": "Deforme",
            "label": "Deforme",
            "displayLabel": "Deforme",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Deforme"
          },
          {
            "optionType": "label",
            "value": "Kontrol Tavsiye",
            "label": "Kontrol Tavsiye",
            "displayLabel": "Kontrol Tavsiye",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Kontrol Tavsiye"
          },
          {
            "optionType": "label",
            "value": "Yok",
            "label": "Yok",
            "displayLabel": "Yok",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Yok"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 4,
        "labeledOptionCount": 4,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 2
        }
      },
      {
        "order": 35,
        "itemNo": 35,
        "noktaId": "148",
        "itemId": "n148-sag-on-koltuk-isitma",
        "title": "Sağ Ön - Koltuk Isıtma",
        "moduleId": "ic-ekspertiz",
        "moduleTitle": "İÇ EKSPERTİZ VE CHECK-UP",
        "statusOptions": [
          "Çalışıyor",
          "Çalışmıyor",
          "Yok"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "Çalışıyor",
            "label": "Çalışıyor",
            "displayLabel": "Çalışıyor",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Çalışıyor"
          },
          {
            "optionType": "label",
            "value": "Çalışmıyor",
            "label": "Çalışmıyor",
            "displayLabel": "Çalışmıyor",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Çalışmıyor"
          },
          {
            "optionType": "label",
            "value": "Yok",
            "label": "Yok",
            "displayLabel": "Yok",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Yok"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 3,
        "labeledOptionCount": 3,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 2
        }
      },
      {
        "order": 36,
        "itemNo": 36,
        "noktaId": "149",
        "itemId": "n149-sag-on-elektrikli-koltuk",
        "title": "Sağ Ön - Elektrikli Koltuk",
        "moduleId": "ic-ekspertiz",
        "moduleTitle": "İÇ EKSPERTİZ VE CHECK-UP",
        "statusOptions": [
          "Çalışıyor",
          "Çalışmıyor",
          "Yok"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "Çalışıyor",
            "label": "Çalışıyor",
            "displayLabel": "Çalışıyor",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Çalışıyor"
          },
          {
            "optionType": "label",
            "value": "Çalışmıyor",
            "label": "Çalışmıyor",
            "displayLabel": "Çalışmıyor",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Çalışmıyor"
          },
          {
            "optionType": "label",
            "value": "Yok",
            "label": "Yok",
            "displayLabel": "Yok",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Yok"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 3,
        "labeledOptionCount": 3,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 2
        }
      },
      {
        "order": 37,
        "itemNo": 37,
        "noktaId": "150",
        "itemId": "n150-sag-on-cam-dugmeleri",
        "title": "Sağ Ön - Cam Düğmeleri",
        "moduleId": "ic-ekspertiz",
        "moduleTitle": "İÇ EKSPERTİZ VE CHECK-UP",
        "statusOptions": [
          "Çalışıyor",
          "Çalışmıyor",
          "Bakılamadı"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "Çalışıyor",
            "label": "Çalışıyor",
            "displayLabel": "Çalışıyor",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Çalışıyor"
          },
          {
            "optionType": "label",
            "value": "Çalışmıyor",
            "label": "Çalışmıyor",
            "displayLabel": "Çalışmıyor",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Çalışmıyor"
          },
          {
            "optionType": "label",
            "value": "Bakılamadı",
            "label": "Bakılamadı",
            "displayLabel": "Bakılamadı",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Bakılamadı"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 3,
        "labeledOptionCount": 3,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 1
        }
      },
      {
        "order": 38,
        "itemNo": 38,
        "noktaId": "151",
        "itemId": "n151-sag-on-emniyet-kemeri",
        "title": "Sağ Ön - Emniyet Kemeri",
        "moduleId": "ic-ekspertiz",
        "moduleTitle": "İÇ EKSPERTİZ VE CHECK-UP",
        "statusOptions": [
          "Çalışıyor",
          "Çalışmıyor",
          "Bakılamadı"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "Çalışıyor",
            "label": "Çalışıyor",
            "displayLabel": "Çalışıyor",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Çalışıyor"
          },
          {
            "optionType": "label",
            "value": "Çalışmıyor",
            "label": "Çalışmıyor",
            "displayLabel": "Çalışmıyor",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Çalışmıyor"
          },
          {
            "optionType": "label",
            "value": "Bakılamadı",
            "label": "Bakılamadı",
            "displayLabel": "Bakılamadı",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Bakılamadı"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 3,
        "labeledOptionCount": 3,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 1
        }
      },
      {
        "order": 39,
        "itemNo": 39,
        "noktaId": "155",
        "itemId": "n155-sag-on-kapi-kilit-kollar-ve-doseme",
        "title": "Sağ Ön - Kapı Kilit Kollar ve Döşeme",
        "moduleId": "ic-ekspertiz",
        "moduleTitle": "İÇ EKSPERTİZ VE CHECK-UP",
        "statusOptions": [],
        "options": [
          {
            "optionType": "checkbox",
            "value": "296",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=296"
          },
          {
            "optionType": "checkbox",
            "value": "392",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=392"
          },
          {
            "optionType": "checkbox",
            "value": "945",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=945"
          },
          {
            "optionType": "checkbox",
            "value": "580",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=580"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 4,
        "labeledOptionCount": 0,
        "placeholderOptionCount": 4,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": true,
          "criticalOptionCountHeuristic": 0
        }
      },
      {
        "order": 40,
        "itemNo": 40,
        "noktaId": "316",
        "itemId": "n316-araca-acil-olarak-detayli-temizlik-gerekli-mi",
        "title": "Araca Acil Olarak Detaylı Temizlik Gerekli mi?",
        "moduleId": "ic-ekspertiz",
        "moduleTitle": "İÇ EKSPERTİZ VE CHECK-UP",
        "statusOptions": [
          "Hayır",
          "Evet"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "Hayır",
            "label": "Hayır",
            "displayLabel": "Hayır",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Hayır"
          },
          {
            "optionType": "label",
            "value": "Evet",
            "label": "Evet",
            "displayLabel": "Evet",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Evet"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 2,
        "labeledOptionCount": 2,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 1
        }
      },
      {
        "order": 41,
        "itemNo": 41,
        "noktaId": "324",
        "itemId": "n324-aracta-olagan-disi-bir-ses-mevcut-mu",
        "title": "Araçta Olağan Dışı Bir Ses Mevcut mu?",
        "moduleId": "ic-ekspertiz",
        "moduleTitle": "İÇ EKSPERTİZ VE CHECK-UP",
        "statusOptions": [
          "Hayır, Sorunsuz",
          "Araçta Harici Ses Mevcut"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "Hayır, Sorunsuz",
            "label": "Hayır, Sorunsuz",
            "displayLabel": "Hayır, Sorunsuz",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Hayır, Sorunsuz"
          },
          {
            "optionType": "label",
            "value": "Araçta Harici Ses Mevcut",
            "label": "Araçta Harici Ses Mevcut",
            "displayLabel": "Araçta Harici Ses Mevcut",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Araçta Harici Ses Mevcut"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 2,
        "labeledOptionCount": 2,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": false,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 0
        }
      },
      {
        "order": 42,
        "itemNo": 42,
        "noktaId": "326",
        "itemId": "n326-arac-kozmetiginde-kullanima-bagli-deformasyon-mevc",
        "title": "Araç Kozmetiğinde Kullanıma Bağlı Deformasyon Mevcut mu?",
        "moduleId": "ic-ekspertiz",
        "moduleTitle": "İÇ EKSPERTİZ VE CHECK-UP",
        "statusOptions": [],
        "options": [
          {
            "optionType": "checkbox",
            "value": "1611",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1611"
          },
          {
            "optionType": "checkbox",
            "value": "1612",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1612"
          },
          {
            "optionType": "checkbox",
            "value": "1613",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1613"
          },
          {
            "optionType": "checkbox",
            "value": "1614",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1614"
          },
          {
            "optionType": "checkbox",
            "value": "1615",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1615"
          },
          {
            "optionType": "checkbox",
            "value": "1616",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=1616"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 6,
        "labeledOptionCount": 0,
        "placeholderOptionCount": 6,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": true,
          "criticalOptionCountHeuristic": 0
        }
      },
      {
        "order": 43,
        "itemNo": 43,
        "noktaId": "1230",
        "itemId": "n1230-pandizot",
        "title": "Pandizot",
        "moduleId": "ic-ekspertiz",
        "moduleTitle": "İÇ EKSPERTİZ VE CHECK-UP",
        "statusOptions": [],
        "options": [
          {
            "optionType": "checkbox",
            "value": "5463",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=5463"
          },
          {
            "optionType": "checkbox",
            "value": "5460",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=5460"
          },
          {
            "optionType": "checkbox",
            "value": "5461",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=5461"
          },
          {
            "optionType": "checkbox",
            "value": "5462",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=5462"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 4,
        "labeledOptionCount": 0,
        "placeholderOptionCount": 4,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": true,
          "criticalOptionCountHeuristic": 0
        }
      },
      {
        "order": 44,
        "itemNo": 44,
        "noktaId": "1248",
        "itemId": "n1248-sunroof-perdesi",
        "title": "Sunroof Perdesi",
        "moduleId": "ic-ekspertiz",
        "moduleTitle": "İÇ EKSPERTİZ VE CHECK-UP",
        "statusOptions": [
          "İyi",
          "Hasarlı, Kırık",
          "Yok"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "İyi",
            "label": "İyi",
            "displayLabel": "İyi",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "İyi"
          },
          {
            "optionType": "label",
            "value": "Hasarlı, Kırık",
            "label": "Hasarlı, Kırık",
            "displayLabel": "Hasarlı, Kırık",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Hasarlı, Kırık"
          },
          {
            "optionType": "label",
            "value": "Yok",
            "label": "Yok",
            "displayLabel": "Yok",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Yok"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 3,
        "labeledOptionCount": 3,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 2
        }
      },
      {
        "order": 45,
        "itemNo": 45,
        "noktaId": "1876",
        "itemId": "n1876-direksiyon-simidi",
        "title": "Direksiyon Simidi",
        "moduleId": "ic-ekspertiz",
        "moduleTitle": "İÇ EKSPERTİZ VE CHECK-UP",
        "statusOptions": [
          "İyi",
          "Deforme",
          "Orta"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "İyi",
            "label": "İyi",
            "displayLabel": "İyi",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "İyi"
          },
          {
            "optionType": "label",
            "value": "Deforme",
            "label": "Deforme",
            "displayLabel": "Deforme",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Deforme"
          },
          {
            "optionType": "label",
            "value": "Orta",
            "label": "Orta",
            "displayLabel": "Orta",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Orta"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 3,
        "labeledOptionCount": 3,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 1
        }
      },
      {
        "order": 46,
        "itemNo": 46,
        "noktaId": "1877",
        "itemId": "n1877-taban-halisi",
        "title": "Taban Halısı",
        "moduleId": "ic-ekspertiz",
        "moduleTitle": "İÇ EKSPERTİZ VE CHECK-UP",
        "statusOptions": [],
        "options": [
          {
            "optionType": "checkbox",
            "value": "8647",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=8647"
          },
          {
            "optionType": "checkbox",
            "value": "8648",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=8648"
          },
          {
            "optionType": "checkbox",
            "value": "8649",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=8649"
          },
          {
            "optionType": "checkbox",
            "value": "8650",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=8650"
          },
          {
            "optionType": "checkbox",
            "value": "8651",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=8651"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 5,
        "labeledOptionCount": 0,
        "placeholderOptionCount": 5,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": true,
          "criticalOptionCountHeuristic": 0
        }
      }
    ]
  },
  {
    "moduleNo": 9,
    "moduleId": "airbag",
    "key": "airbag",
    "title": "Airbag (Hava Yastıkları) Kontrol Testi",
    "shortTitle": "Airbag",
    "groupTitle": "Airbag (Hava Yastıkları) Kontrol Testi",
    "groupTitles": [
      "Airbag (Hava Yastıkları) Kontrol Testi"
    ],
    "itemCount": 9,
    "items": [
      {
        "order": 1,
        "itemNo": 1,
        "noktaId": "1115",
        "itemId": "n1115-airbag-isigi-yaniyor-mu",
        "title": "Airbag Işığı Yanıyor mu?",
        "moduleId": "airbag",
        "moduleTitle": "Airbag (Hava Yastıkları) Kontrol Testi",
        "statusOptions": [
          "Yanıyor, Arıza Mevcut",
          "Yanmıyor"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "Yanıyor, Arıza Mevcut",
            "label": "Yanıyor, Arıza Mevcut",
            "displayLabel": "Yanıyor, Arıza Mevcut",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Yanıyor, Arıza Mevcut"
          },
          {
            "optionType": "label",
            "value": "Yanmıyor",
            "label": "Yanmıyor",
            "displayLabel": "Yanmıyor",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Yanmıyor"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 2,
        "labeledOptionCount": 2,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 2
        }
      },
      {
        "order": 2,
        "itemNo": 2,
        "noktaId": "1116",
        "itemId": "n1116-direksiyon-simidi-airbag-kontrolu",
        "title": "Direksiyon Simidi Airbag Kontrolü",
        "moduleId": "airbag",
        "moduleTitle": "Airbag (Hava Yastıkları) Kontrol Testi",
        "statusOptions": [
          "Sorunsuz",
          "Sorunlu, İşlem Mevcut",
          "Tarih Görülemedi",
          "Değiştirilmiştir"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "Sorunsuz",
            "label": "Sorunsuz",
            "displayLabel": "Sorunsuz",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Sorunsuz"
          },
          {
            "optionType": "label",
            "value": "Sorunlu, İşlem Mevcut",
            "label": "Sorunlu, İşlem Mevcut",
            "displayLabel": "Sorunlu, İşlem Mevcut",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Sorunlu, İşlem Mevcut"
          },
          {
            "optionType": "label",
            "value": "Tarih Görülemedi",
            "label": "Tarih Görülemedi",
            "displayLabel": "Tarih Görülemedi",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Tarih Görülemedi"
          },
          {
            "optionType": "label",
            "value": "Değiştirilmiştir",
            "label": "Değiştirilmiştir",
            "displayLabel": "Değiştirilmiştir",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Değiştirilmiştir"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 4,
        "labeledOptionCount": 4,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 1
        }
      },
      {
        "order": 3,
        "itemNo": 3,
        "noktaId": "1117",
        "itemId": "n1117-torpido-airbag-kontrolu",
        "title": "Torpido Airbag Kontrolü",
        "moduleId": "airbag",
        "moduleTitle": "Airbag (Hava Yastıkları) Kontrol Testi",
        "statusOptions": [
          "Sorunsuz",
          "Sorunlu, İşlem Mevcut",
          "Kaplama Mevcut",
          "Yok",
          "Tarih Görülemedi",
          "Değiştirilmiştir"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "Sorunsuz",
            "label": "Sorunsuz",
            "displayLabel": "Sorunsuz",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Sorunsuz"
          },
          {
            "optionType": "label",
            "value": "Sorunlu, İşlem Mevcut",
            "label": "Sorunlu, İşlem Mevcut",
            "displayLabel": "Sorunlu, İşlem Mevcut",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Sorunlu, İşlem Mevcut"
          },
          {
            "optionType": "label",
            "value": "Kaplama Mevcut",
            "label": "Kaplama Mevcut",
            "displayLabel": "Kaplama Mevcut",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Kaplama Mevcut"
          },
          {
            "optionType": "label",
            "value": "Yok",
            "label": "Yok",
            "displayLabel": "Yok",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Yok"
          },
          {
            "optionType": "label",
            "value": "Tarih Görülemedi",
            "label": "Tarih Görülemedi",
            "displayLabel": "Tarih Görülemedi",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Tarih Görülemedi"
          },
          {
            "optionType": "label",
            "value": "Değiştirilmiştir",
            "label": "Değiştirilmiştir",
            "displayLabel": "Değiştirilmiştir",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Değiştirilmiştir"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 6,
        "labeledOptionCount": 6,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 2
        }
      },
      {
        "order": 4,
        "itemNo": 4,
        "noktaId": "1118",
        "itemId": "n1118-perde-airbag-kontrolu",
        "title": "Perde Airbag Kontrolü",
        "moduleId": "airbag",
        "moduleTitle": "Airbag (Hava Yastıkları) Kontrol Testi",
        "statusOptions": [
          "Sorunlu, İşlem Mevcut",
          "Sorunsuz",
          "Tarih Görülemedi",
          "Yok"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "Sorunlu, İşlem Mevcut",
            "label": "Sorunlu, İşlem Mevcut",
            "displayLabel": "Sorunlu, İşlem Mevcut",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Sorunlu, İşlem Mevcut"
          },
          {
            "optionType": "label",
            "value": "Sorunsuz",
            "label": "Sorunsuz",
            "displayLabel": "Sorunsuz",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Sorunsuz"
          },
          {
            "optionType": "label",
            "value": "Tarih Görülemedi",
            "label": "Tarih Görülemedi",
            "displayLabel": "Tarih Görülemedi",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Tarih Görülemedi"
          },
          {
            "optionType": "label",
            "value": "Yok",
            "label": "Yok",
            "displayLabel": "Yok",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Yok"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 4,
        "labeledOptionCount": 4,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 2
        }
      },
      {
        "order": 5,
        "itemNo": 5,
        "noktaId": "1119",
        "itemId": "n1119-emniyet-kemerleri-direnc-kontrolu",
        "title": "Emniyet Kemerleri Direnç Kontrolü",
        "moduleId": "airbag",
        "moduleTitle": "Airbag (Hava Yastıkları) Kontrol Testi",
        "statusOptions": [
          "Sorunsuz",
          "Sorunlu, Direnç İşlemi Mevcut",
          "Değiştirilmiştir",
          "Aktif Gergi Yok"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "Sorunsuz",
            "label": "Sorunsuz",
            "displayLabel": "Sorunsuz",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Sorunsuz"
          },
          {
            "optionType": "label",
            "value": "Sorunlu, Direnç İşlemi Mevcut",
            "label": "Sorunlu, Direnç İşlemi Mevcut",
            "displayLabel": "Sorunlu, Direnç İşlemi Mevcut",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Sorunlu, Direnç İşlemi Mevcut"
          },
          {
            "optionType": "label",
            "value": "Değiştirilmiştir",
            "label": "Değiştirilmiştir",
            "displayLabel": "Değiştirilmiştir",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Değiştirilmiştir"
          },
          {
            "optionType": "label",
            "value": "Aktif Gergi Yok",
            "label": "Aktif Gergi Yok",
            "displayLabel": "Aktif Gergi Yok",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Aktif Gergi Yok"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 4,
        "labeledOptionCount": 4,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 2
        }
      },
      {
        "order": 6,
        "itemNo": 6,
        "noktaId": "1121",
        "itemId": "n1121-arac-saticisi-vekili-izin-formu-fotografi",
        "title": "Araç Satıcısı/Vekili İzin Formu Fotoğrafı",
        "moduleId": "airbag",
        "moduleTitle": "Airbag (Hava Yastıkları) Kontrol Testi",
        "statusOptions": [
          "Araç Satıcısı/Vekili İzin Formu Fotoğrafı"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "Araç Satıcısı/Vekili İzin Formu Fotoğrafı",
            "label": "Araç Satıcısı/Vekili İzin Formu Fotoğrafı",
            "displayLabel": "Araç Satıcısı/Vekili İzin Formu Fotoğrafı",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Araç Satıcısı/Vekili İzin Formu Fotoğrafı"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 1,
        "labeledOptionCount": 1,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": false,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 0
        }
      },
      {
        "order": 7,
        "itemNo": 7,
        "noktaId": "1257",
        "itemId": "n1257-diz-airbag-kontrolu",
        "title": "Diz Airbag Kontrolü",
        "moduleId": "airbag",
        "moduleTitle": "Airbag (Hava Yastıkları) Kontrol Testi",
        "statusOptions": [
          "Sorunsuz",
          "Sorunlu, İşlem Mevcut",
          "Yok",
          "Tarih Görülemedi"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "Sorunsuz",
            "label": "Sorunsuz",
            "displayLabel": "Sorunsuz",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Sorunsuz"
          },
          {
            "optionType": "label",
            "value": "Sorunlu, İşlem Mevcut",
            "label": "Sorunlu, İşlem Mevcut",
            "displayLabel": "Sorunlu, İşlem Mevcut",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Sorunlu, İşlem Mevcut"
          },
          {
            "optionType": "label",
            "value": "Yok",
            "label": "Yok",
            "displayLabel": "Yok",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Yok"
          },
          {
            "optionType": "label",
            "value": "Tarih Görülemedi",
            "label": "Tarih Görülemedi",
            "displayLabel": "Tarih Görülemedi",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Tarih Görülemedi"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 4,
        "labeledOptionCount": 4,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 2
        }
      },
      {
        "order": 8,
        "itemNo": 8,
        "noktaId": "1258",
        "itemId": "n1258-koltuk-airbag-kontrolu",
        "title": "Koltuk Airbag Kontrolü",
        "moduleId": "airbag",
        "moduleTitle": "Airbag (Hava Yastıkları) Kontrol Testi",
        "statusOptions": [
          "Sorunsuz",
          "Sorunlu, İşlem Mevcut",
          "Yok",
          "Harici Döşeme, Koltuk Kılıfı Mevcut",
          "Tarih Görülemedi"
        ],
        "options": [
          {
            "optionType": "label",
            "value": "Sorunsuz",
            "label": "Sorunsuz",
            "displayLabel": "Sorunsuz",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Sorunsuz"
          },
          {
            "optionType": "label",
            "value": "Sorunlu, İşlem Mevcut",
            "label": "Sorunlu, İşlem Mevcut",
            "displayLabel": "Sorunlu, İşlem Mevcut",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Sorunlu, İşlem Mevcut"
          },
          {
            "optionType": "label",
            "value": "Yok",
            "label": "Yok",
            "displayLabel": "Yok",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Yok"
          },
          {
            "optionType": "label",
            "value": "Harici Döşeme, Koltuk Kılıfı Mevcut",
            "label": "Harici Döşeme, Koltuk Kılıfı Mevcut",
            "displayLabel": "Harici Döşeme, Koltuk Kılıfı Mevcut",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Harici Döşeme, Koltuk Kılıfı Mevcut"
          },
          {
            "optionType": "label",
            "value": "Tarih Görülemedi",
            "label": "Tarih Görülemedi",
            "displayLabel": "Tarih Görülemedi",
            "needsLabelMap": false,
            "disabled": false,
            "rawValueHidden": false,
            "sourceText": "Tarih Görülemedi"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 5,
        "labeledOptionCount": 5,
        "placeholderOptionCount": 0,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": false,
          "criticalOptionCountHeuristic": 2
        }
      },
      {
        "order": 9,
        "itemNo": 9,
        "noktaId": "1994",
        "itemId": "n1994-emniyet-kemeri-toka-tarihi",
        "title": "Emniyet Kemeri Toka Tarihi",
        "moduleId": "airbag",
        "moduleTitle": "Airbag (Hava Yastıkları) Kontrol Testi",
        "statusOptions": [],
        "options": [
          {
            "optionType": "checkbox",
            "value": "9356",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=9356"
          },
          {
            "optionType": "checkbox",
            "value": "9357",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=9357"
          },
          {
            "optionType": "checkbox",
            "value": "9358",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=9358"
          }
        ],
        "inputs": [
          {
            "inputType": "text",
            "label": "Tarih",
            "name": "EkAlan",
            "sourceText": "text (Tarih) name=EkAlan"
          }
        ],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 3,
        "labeledOptionCount": 0,
        "placeholderOptionCount": 3,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": true,
          "criticalOptionCountHeuristic": 0
        }
      }
    ]
  },
  {
    "moduleNo": 10,
    "moduleId": "conta-kacak",
    "key": "conta-kacak",
    "title": "CONTA KAÇAK TESTİ",
    "shortTitle": "Conta Kaçak",
    "groupTitle": "CONTA KAÇAK TESTİ",
    "groupTitles": [
      "CONTA KAÇAK TESTİ"
    ],
    "itemCount": 1,
    "items": [
      {
        "order": 1,
        "itemNo": 1,
        "noktaId": "1255",
        "itemId": "n1255-conta-kacak-testi",
        "title": "CONTA KAÇAK TESTİ",
        "moduleId": "conta-kacak",
        "moduleTitle": "CONTA KAÇAK TESTİ",
        "statusOptions": [],
        "options": [
          {
            "optionType": "checkbox",
            "value": "5525",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=5525"
          },
          {
            "optionType": "checkbox",
            "value": "7286",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=7286"
          },
          {
            "optionType": "checkbox",
            "value": "5526",
            "displayLabel": "Seçenek etiketi doğrulanacak",
            "needsLabelMap": true,
            "disabled": true,
            "rawValueHidden": true,
            "sourceText": "checkbox:value=5526"
          }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 3,
        "photos": [
          null,
          null,
          null
        ],
        "required": true,
        "source": "otorapor_2614045_plus_pro",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 3,
        "labeledOptionCount": 0,
        "placeholderOptionCount": 3,
        "uiHints": {
          "requiresEvidenceOnCritical": true,
          "defaultEvidenceSlots": 3,
          "showDescriptionField": true,
          "hasUnknownCheckboxLabels": true,
          "criticalOptionCountHeuristic": 0
        }
      }
    ]
  },
  {
    "moduleNo": 11,
    "moduleId": "yol-testi",
    "key": "yol-testi",
    "title": "GERCEK YOL TESTI",
    "shortTitle": "Yol Testi",
    "groupTitle": "GERCEK YOL TESTI",
    "groupTitles": [
      "GERCEK YOL TESTI"
    ],
    "itemCount": 12,
    "items": [
      {
        "order": 1,
        "itemNo": 1,
        "noktaId": "yt-001",
        "itemId": "yt-001-yol-testi-genel-bilgileri",
        "title": "Yol Testi Genel Bilgileri",
        "moduleId": "yol-testi",
        "moduleTitle": "GERCEK YOL TESTI",
        "statusOptions": ["Yapildi", "Kismen Yapildi", "Yapilamadi"],
        "options": [
          { "optionType": "label", "value": "Yapildi", "label": "Yapildi", "displayLabel": "Yapildi", "needsLabelMap": false, "disabled": false, "rawValueHidden": false, "sourceText": "Yapildi" },
          { "optionType": "label", "value": "Kismen Yapildi", "label": "Kismen Yapildi", "displayLabel": "Kismen Yapildi", "needsLabelMap": false, "disabled": false, "rawValueHidden": false, "sourceText": "Kismen Yapildi" },
          { "optionType": "label", "value": "Yapilamadi", "label": "Yapilamadi", "displayLabel": "Yapilamadi", "needsLabelMap": false, "disabled": false, "rawValueHidden": false, "sourceText": "Yapilamadi" }
        ],
        "inputs": [
          { "inputType": "text", "label": "Test suresi / yol tipi / test kilometresi", "name": "roadTestGeneralInfo", "sourceText": "text (Test suresi / yol tipi / test kilometresi) name=roadTestGeneralInfo" }
        ],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 0,
        "photos": [],
        "required": true,
        "source": "ototr_road_test_v1",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 3,
        "labeledOptionCount": 3,
        "placeholderOptionCount": 0,
        "uiHints": { "requiresEvidenceOnCritical": false, "defaultEvidenceSlots": 0, "showDescriptionField": true, "hasUnknownCheckboxLabels": false, "criticalOptionCountHeuristic": 1 }
      },
      {
        "order": 2,
        "itemNo": 2,
        "noktaId": "yt-002",
        "itemId": "yt-002-motor-surus-performansi",
        "title": "Motor Surus Performansi",
        "moduleId": "yol-testi",
        "moduleTitle": "GERCEK YOL TESTI",
        "statusOptions": ["Normal", "Zayif / Gecikmeli", "Tekleme / Silkeleme", "Kritik Problem", "Test Edilemedi"],
        "options": [
          { "optionType": "label", "value": "Normal", "label": "Normal", "displayLabel": "Normal", "needsLabelMap": false, "disabled": false, "rawValueHidden": false, "sourceText": "Normal" },
          { "optionType": "label", "value": "Zayif / Gecikmeli", "label": "Zayif / Gecikmeli", "displayLabel": "Zayif / Gecikmeli", "needsLabelMap": false, "disabled": false, "rawValueHidden": false, "sourceText": "Zayif / Gecikmeli" },
          { "optionType": "label", "value": "Tekleme / Silkeleme", "label": "Tekleme / Silkeleme", "displayLabel": "Tekleme / Silkeleme", "needsLabelMap": false, "disabled": false, "rawValueHidden": false, "sourceText": "Tekleme / Silkeleme" },
          { "optionType": "label", "value": "Kritik Problem", "label": "Kritik Problem", "displayLabel": "Kritik Problem", "needsLabelMap": false, "disabled": false, "rawValueHidden": false, "sourceText": "Kritik Problem" },
          { "optionType": "label", "value": "Test Edilemedi", "label": "Test Edilemedi", "displayLabel": "Test Edilemedi", "needsLabelMap": false, "disabled": false, "rawValueHidden": false, "sourceText": "Test Edilemedi" }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 1,
        "photos": [null],
        "required": true,
        "source": "ototr_road_test_v1",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 5,
        "labeledOptionCount": 5,
        "placeholderOptionCount": 0,
        "uiHints": { "requiresEvidenceOnCritical": true, "defaultEvidenceSlots": 1, "showDescriptionField": true, "hasUnknownCheckboxLabels": false, "criticalOptionCountHeuristic": 2 }
      },
      {
        "order": 3,
        "itemNo": 3,
        "noktaId": "yt-003",
        "itemId": "yt-003-otomatik-sanziman-aktarma",
        "title": "Otomatik Sanziman ve Aktarma",
        "moduleId": "yol-testi",
        "moduleTitle": "GERCEK YOL TESTI",
        "statusOptions": ["Normal", "Gecikmeli / Kararsiz", "Vurma / Sarsinti", "Kaydirma Suphesi", "Arac Otomatik Degil"],
        "options": [
          { "optionType": "label", "value": "Normal", "label": "Normal", "displayLabel": "Normal", "needsLabelMap": false, "disabled": false, "rawValueHidden": false, "sourceText": "Normal" },
          { "optionType": "label", "value": "Gecikmeli / Kararsiz", "label": "Gecikmeli / Kararsiz", "displayLabel": "Gecikmeli / Kararsiz", "needsLabelMap": false, "disabled": false, "rawValueHidden": false, "sourceText": "Gecikmeli / Kararsiz" },
          { "optionType": "label", "value": "Vurma / Sarsinti", "label": "Vurma / Sarsinti", "displayLabel": "Vurma / Sarsinti", "needsLabelMap": false, "disabled": false, "rawValueHidden": false, "sourceText": "Vurma / Sarsinti" },
          { "optionType": "label", "value": "Kaydirma Suphesi", "label": "Kaydirma Suphesi", "displayLabel": "Kaydirma Suphesi", "needsLabelMap": false, "disabled": false, "rawValueHidden": false, "sourceText": "Kaydirma Suphesi" },
          { "optionType": "label", "value": "Arac Otomatik Degil", "label": "Arac Otomatik Degil", "displayLabel": "Arac Otomatik Degil", "needsLabelMap": false, "disabled": false, "rawValueHidden": false, "sourceText": "Arac Otomatik Degil" }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 1,
        "photos": [null],
        "required": true,
        "source": "ototr_road_test_v1",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 5,
        "labeledOptionCount": 5,
        "placeholderOptionCount": 0,
        "uiHints": { "requiresEvidenceOnCritical": true, "defaultEvidenceSlots": 1, "showDescriptionField": true, "hasUnknownCheckboxLabels": false, "criticalOptionCountHeuristic": 2 }
      },
      {
        "order": 4,
        "itemNo": 4,
        "noktaId": "yt-004",
        "itemId": "yt-004-manuel-sanziman-debriyaj",
        "title": "Manuel Sanziman ve Debriyaj",
        "moduleId": "yol-testi",
        "moduleTitle": "GERCEK YOL TESTI",
        "statusOptions": ["Normal", "Sert / Takilma", "Kacirma Suphesi", "Titreme Var", "Arac Manuel Degil"],
        "options": [
          { "optionType": "label", "value": "Normal", "label": "Normal", "displayLabel": "Normal", "needsLabelMap": false, "disabled": false, "rawValueHidden": false, "sourceText": "Normal" },
          { "optionType": "label", "value": "Sert / Takilma", "label": "Sert / Takilma", "displayLabel": "Sert / Takilma", "needsLabelMap": false, "disabled": false, "rawValueHidden": false, "sourceText": "Sert / Takilma" },
          { "optionType": "label", "value": "Kacirma Suphesi", "label": "Kacirma Suphesi", "displayLabel": "Kacirma Suphesi", "needsLabelMap": false, "disabled": false, "rawValueHidden": false, "sourceText": "Kacirma Suphesi" },
          { "optionType": "label", "value": "Titreme Var", "label": "Titreme Var", "displayLabel": "Titreme Var", "needsLabelMap": false, "disabled": false, "rawValueHidden": false, "sourceText": "Titreme Var" },
          { "optionType": "label", "value": "Arac Manuel Degil", "label": "Arac Manuel Degil", "displayLabel": "Arac Manuel Degil", "needsLabelMap": false, "disabled": false, "rawValueHidden": false, "sourceText": "Arac Manuel Degil" }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 1,
        "photos": [null],
        "required": true,
        "source": "ototr_road_test_v1",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 5,
        "labeledOptionCount": 5,
        "placeholderOptionCount": 0,
        "uiHints": { "requiresEvidenceOnCritical": true, "defaultEvidenceSlots": 1, "showDescriptionField": true, "hasUnknownCheckboxLabels": false, "criticalOptionCountHeuristic": 2 }
      },
      {
        "order": 5,
        "itemNo": 5,
        "noktaId": "yt-005",
        "itemId": "yt-005-fren-yol-davranisi",
        "title": "Fren Sistemi Yol Davranisi",
        "moduleId": "yol-testi",
        "moduleTitle": "GERCEK YOL TESTI",
        "statusOptions": ["Normal", "Zayif / Gec Tepki", "Saga / Sola Cekme", "Titresim / Ses", "Kritik"],
        "options": [
          { "optionType": "label", "value": "Normal", "label": "Normal", "displayLabel": "Normal", "needsLabelMap": false, "disabled": false, "rawValueHidden": false, "sourceText": "Normal" },
          { "optionType": "label", "value": "Zayif / Gec Tepki", "label": "Zayif / Gec Tepki", "displayLabel": "Zayif / Gec Tepki", "needsLabelMap": false, "disabled": false, "rawValueHidden": false, "sourceText": "Zayif / Gec Tepki" },
          { "optionType": "label", "value": "Saga / Sola Cekme", "label": "Saga / Sola Cekme", "displayLabel": "Saga / Sola Cekme", "needsLabelMap": false, "disabled": false, "rawValueHidden": false, "sourceText": "Saga / Sola Cekme" },
          { "optionType": "label", "value": "Titresim / Ses", "label": "Titresim / Ses", "displayLabel": "Titresim / Ses", "needsLabelMap": false, "disabled": false, "rawValueHidden": false, "sourceText": "Titresim / Ses" },
          { "optionType": "label", "value": "Kritik", "label": "Kritik", "displayLabel": "Kritik", "needsLabelMap": false, "disabled": false, "rawValueHidden": false, "sourceText": "Kritik" }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 1,
        "photos": [null],
        "required": true,
        "source": "ototr_road_test_v1",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 5,
        "labeledOptionCount": 5,
        "placeholderOptionCount": 0,
        "uiHints": { "requiresEvidenceOnCritical": true, "defaultEvidenceSlots": 1, "showDescriptionField": true, "hasUnknownCheckboxLabels": false, "criticalOptionCountHeuristic": 3 }
      },
      {
        "order": 6,
        "itemNo": 6,
        "noktaId": "yt-006",
        "itemId": "yt-006-direksiyon-yol-tutus",
        "title": "Direksiyon ve Yol Tutus",
        "moduleId": "yol-testi",
        "moduleTitle": "GERCEK YOL TESTI",
        "statusOptions": ["Normal", "Bosluk Var", "Saga / Sola Cekme", "Titreşim Var", "Guvensiz His"],
        "options": [
          { "optionType": "label", "value": "Normal", "label": "Normal", "displayLabel": "Normal", "needsLabelMap": false, "disabled": false, "rawValueHidden": false, "sourceText": "Normal" },
          { "optionType": "label", "value": "Bosluk Var", "label": "Bosluk Var", "displayLabel": "Bosluk Var", "needsLabelMap": false, "disabled": false, "rawValueHidden": false, "sourceText": "Bosluk Var" },
          { "optionType": "label", "value": "Saga / Sola Cekme", "label": "Saga / Sola Cekme", "displayLabel": "Saga / Sola Cekme", "needsLabelMap": false, "disabled": false, "rawValueHidden": false, "sourceText": "Saga / Sola Cekme" },
          { "optionType": "label", "value": "Titreşim Var", "label": "Titreşim Var", "displayLabel": "Titreşim Var", "needsLabelMap": false, "disabled": false, "rawValueHidden": false, "sourceText": "Titreşim Var" },
          { "optionType": "label", "value": "Guvensiz His", "label": "Guvensiz His", "displayLabel": "Guvensiz His", "needsLabelMap": false, "disabled": false, "rawValueHidden": false, "sourceText": "Guvensiz His" }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 1,
        "photos": [null],
        "required": true,
        "source": "ototr_road_test_v1",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 5,
        "labeledOptionCount": 5,
        "placeholderOptionCount": 0,
        "uiHints": { "requiresEvidenceOnCritical": true, "defaultEvidenceSlots": 1, "showDescriptionField": true, "hasUnknownCheckboxLabels": false, "criticalOptionCountHeuristic": 2 }
      },
      {
        "order": 7,
        "itemNo": 7,
        "noktaId": "yt-007",
        "itemId": "yt-007-suspansiyon-yuruyen-aksam",
        "title": "Suspansiyon, Amortisor ve Yuruyen Aksam",
        "moduleId": "yol-testi",
        "moduleTitle": "GERCEK YOL TESTI",
        "statusOptions": ["Normal", "Hafif Ses", "Vuruntu / Gicirti", "Salinim Fazla", "Kritik"],
        "options": [
          { "optionType": "label", "value": "Normal", "label": "Normal", "displayLabel": "Normal", "needsLabelMap": false, "disabled": false, "rawValueHidden": false, "sourceText": "Normal" },
          { "optionType": "label", "value": "Hafif Ses", "label": "Hafif Ses", "displayLabel": "Hafif Ses", "needsLabelMap": false, "disabled": false, "rawValueHidden": false, "sourceText": "Hafif Ses" },
          { "optionType": "label", "value": "Vuruntu / Gicirti", "label": "Vuruntu / Gicirti", "displayLabel": "Vuruntu / Gicirti", "needsLabelMap": false, "disabled": false, "rawValueHidden": false, "sourceText": "Vuruntu / Gicirti" },
          { "optionType": "label", "value": "Salinim Fazla", "label": "Salinim Fazla", "displayLabel": "Salinim Fazla", "needsLabelMap": false, "disabled": false, "rawValueHidden": false, "sourceText": "Salinim Fazla" },
          { "optionType": "label", "value": "Kritik", "label": "Kritik", "displayLabel": "Kritik", "needsLabelMap": false, "disabled": false, "rawValueHidden": false, "sourceText": "Kritik" }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 1,
        "photos": [null],
        "required": true,
        "source": "ototr_road_test_v1",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 5,
        "labeledOptionCount": 5,
        "placeholderOptionCount": 0,
        "uiHints": { "requiresEvidenceOnCritical": true, "defaultEvidenceSlots": 1, "showDescriptionField": true, "hasUnknownCheckboxLabels": false, "criticalOptionCountHeuristic": 3 }
      },
      {
        "order": 8,
        "itemNo": 8,
        "noktaId": "yt-008",
        "itemId": "yt-008-aks-diferansiyel-aktarma-sesleri",
        "title": "Aks, Diferansiyel ve Aktarma Sesleri",
        "moduleId": "yol-testi",
        "moduleTitle": "GERCEK YOL TESTI",
        "statusOptions": ["Yok", "Hafif Bosluk", "Tikirtı / Citirti", "Ugultu", "Kritik"],
        "options": [
          { "optionType": "label", "value": "Yok", "label": "Yok", "displayLabel": "Yok", "needsLabelMap": false, "disabled": false, "rawValueHidden": false, "sourceText": "Yok" },
          { "optionType": "label", "value": "Hafif Bosluk", "label": "Hafif Bosluk", "displayLabel": "Hafif Bosluk", "needsLabelMap": false, "disabled": false, "rawValueHidden": false, "sourceText": "Hafif Bosluk" },
          { "optionType": "label", "value": "Tikirtı / Citirti", "label": "Tikirtı / Citirti", "displayLabel": "Tikirtı / Citirti", "needsLabelMap": false, "disabled": false, "rawValueHidden": false, "sourceText": "Tikirtı / Citirti" },
          { "optionType": "label", "value": "Ugultu", "label": "Ugultu", "displayLabel": "Ugultu", "needsLabelMap": false, "disabled": false, "rawValueHidden": false, "sourceText": "Ugultu" },
          { "optionType": "label", "value": "Kritik", "label": "Kritik", "displayLabel": "Kritik", "needsLabelMap": false, "disabled": false, "rawValueHidden": false, "sourceText": "Kritik" }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 1,
        "photos": [null],
        "required": true,
        "source": "ototr_road_test_v1",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 5,
        "labeledOptionCount": 5,
        "placeholderOptionCount": 0,
        "uiHints": { "requiresEvidenceOnCritical": true, "defaultEvidenceSlots": 1, "showDescriptionField": true, "hasUnknownCheckboxLabels": false, "criticalOptionCountHeuristic": 3 }
      },
      {
        "order": 9,
        "itemNo": 9,
        "noktaId": "yt-009",
        "itemId": "yt-009-kabin-ses-titresim-konfor",
        "title": "Kabin Ici Ses, Titresim ve Konfor",
        "moduleId": "yol-testi",
        "moduleTitle": "GERCEK YOL TESTI",
        "statusOptions": ["Normal", "Hafif Ses / Titresim", "Belirgin Titresim", "Trim / Ruzgar Sesi", "Kontrol Onerilir"],
        "options": [
          { "optionType": "label", "value": "Normal", "label": "Normal", "displayLabel": "Normal", "needsLabelMap": false, "disabled": false, "rawValueHidden": false, "sourceText": "Normal" },
          { "optionType": "label", "value": "Hafif Ses / Titresim", "label": "Hafif Ses / Titresim", "displayLabel": "Hafif Ses / Titresim", "needsLabelMap": false, "disabled": false, "rawValueHidden": false, "sourceText": "Hafif Ses / Titresim" },
          { "optionType": "label", "value": "Belirgin Titresim", "label": "Belirgin Titresim", "displayLabel": "Belirgin Titresim", "needsLabelMap": false, "disabled": false, "rawValueHidden": false, "sourceText": "Belirgin Titresim" },
          { "optionType": "label", "value": "Trim / Ruzgar Sesi", "label": "Trim / Ruzgar Sesi", "displayLabel": "Trim / Ruzgar Sesi", "needsLabelMap": false, "disabled": false, "rawValueHidden": false, "sourceText": "Trim / Ruzgar Sesi" },
          { "optionType": "label", "value": "Kontrol Onerilir", "label": "Kontrol Onerilir", "displayLabel": "Kontrol Onerilir", "needsLabelMap": false, "disabled": false, "rawValueHidden": false, "sourceText": "Kontrol Onerilir" }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 0,
        "photos": [],
        "required": true,
        "source": "ototr_road_test_v1",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 5,
        "labeledOptionCount": 5,
        "placeholderOptionCount": 0,
        "uiHints": { "requiresEvidenceOnCritical": false, "defaultEvidenceSlots": 0, "showDescriptionField": true, "hasUnknownCheckboxLabels": false, "criticalOptionCountHeuristic": 1 }
      },
      {
        "order": 10,
        "itemNo": 10,
        "noktaId": "yt-010",
        "itemId": "yt-010-elektronik-sistemler-uyarilar",
        "title": "Elektronik Sistemler ve Uyarilar",
        "moduleId": "yol-testi",
        "moduleTitle": "GERCEK YOL TESTI",
        "statusOptions": ["Uyari Yok", "Motor / ABS / ESP Uyarisi", "Airbag / TPMS Uyarisi", "Surus Destegi Sorunu", "Test Edilemedi"],
        "options": [
          { "optionType": "label", "value": "Uyari Yok", "label": "Uyari Yok", "displayLabel": "Uyari Yok", "needsLabelMap": false, "disabled": false, "rawValueHidden": false, "sourceText": "Uyari Yok" },
          { "optionType": "label", "value": "Motor / ABS / ESP Uyarisi", "label": "Motor / ABS / ESP Uyarisi", "displayLabel": "Motor / ABS / ESP Uyarisi", "needsLabelMap": false, "disabled": false, "rawValueHidden": false, "sourceText": "Motor / ABS / ESP Uyarisi" },
          { "optionType": "label", "value": "Airbag / TPMS Uyarisi", "label": "Airbag / TPMS Uyarisi", "displayLabel": "Airbag / TPMS Uyarisi", "needsLabelMap": false, "disabled": false, "rawValueHidden": false, "sourceText": "Airbag / TPMS Uyarisi" },
          { "optionType": "label", "value": "Surus Destegi Sorunu", "label": "Surus Destegi Sorunu", "displayLabel": "Surus Destegi Sorunu", "needsLabelMap": false, "disabled": false, "rawValueHidden": false, "sourceText": "Surus Destegi Sorunu" },
          { "optionType": "label", "value": "Test Edilemedi", "label": "Test Edilemedi", "displayLabel": "Test Edilemedi", "needsLabelMap": false, "disabled": false, "rawValueHidden": false, "sourceText": "Test Edilemedi" }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 1,
        "photos": [null],
        "required": true,
        "source": "ototr_road_test_v1",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 5,
        "labeledOptionCount": 5,
        "placeholderOptionCount": 0,
        "uiHints": { "requiresEvidenceOnCritical": true, "defaultEvidenceSlots": 1, "showDescriptionField": true, "hasUnknownCheckboxLabels": false, "criticalOptionCountHeuristic": 3 }
      },
      {
        "order": 11,
        "itemNo": 11,
        "noktaId": "yt-011",
        "itemId": "yt-011-hibrit-elektrikli-yol-testi",
        "title": "Hibrit / Elektrikli Arac Yol Testi",
        "moduleId": "yol-testi",
        "moduleTitle": "GERCEK YOL TESTI",
        "statusOptions": ["Normal", "Rejeneratif Fren Sorunu", "Gecis Sarsintili", "Batarya Uyarisi", "Arac Hibrit / Elektrikli Degil"],
        "options": [
          { "optionType": "label", "value": "Normal", "label": "Normal", "displayLabel": "Normal", "needsLabelMap": false, "disabled": false, "rawValueHidden": false, "sourceText": "Normal" },
          { "optionType": "label", "value": "Rejeneratif Fren Sorunu", "label": "Rejeneratif Fren Sorunu", "displayLabel": "Rejeneratif Fren Sorunu", "needsLabelMap": false, "disabled": false, "rawValueHidden": false, "sourceText": "Rejeneratif Fren Sorunu" },
          { "optionType": "label", "value": "Gecis Sarsintili", "label": "Gecis Sarsintili", "displayLabel": "Gecis Sarsintili", "needsLabelMap": false, "disabled": false, "rawValueHidden": false, "sourceText": "Gecis Sarsintili" },
          { "optionType": "label", "value": "Batarya Uyarisi", "label": "Batarya Uyarisi", "displayLabel": "Batarya Uyarisi", "needsLabelMap": false, "disabled": false, "rawValueHidden": false, "sourceText": "Batarya Uyarisi" },
          { "optionType": "label", "value": "Arac Hibrit / Elektrikli Degil", "label": "Arac Hibrit / Elektrikli Degil", "displayLabel": "Arac Hibrit / Elektrikli Degil", "needsLabelMap": false, "disabled": false, "rawValueHidden": false, "sourceText": "Arac Hibrit / Elektrikli Degil" }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 1,
        "photos": [null],
        "required": false,
        "source": "ototr_road_test_v1",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 5,
        "labeledOptionCount": 5,
        "placeholderOptionCount": 0,
        "uiHints": { "requiresEvidenceOnCritical": true, "defaultEvidenceSlots": 1, "showDescriptionField": true, "hasUnknownCheckboxLabels": false, "criticalOptionCountHeuristic": 2 }
      },
      {
        "order": 12,
        "itemNo": 12,
        "noktaId": "yt-012",
        "itemId": "yt-012-yol-testi-genel-sonuc",
        "title": "Yol Testi Genel Sonuc",
        "moduleId": "yol-testi",
        "moduleTitle": "GERCEK YOL TESTI",
        "statusOptions": ["Normal", "Izlenmeli", "Servis Kontrolu Onerilir", "Kritik Problem Var"],
        "options": [
          { "optionType": "label", "value": "Normal", "label": "Normal", "displayLabel": "Normal", "needsLabelMap": false, "disabled": false, "rawValueHidden": false, "sourceText": "Normal" },
          { "optionType": "label", "value": "Izlenmeli", "label": "Izlenmeli", "displayLabel": "Izlenmeli", "needsLabelMap": false, "disabled": false, "rawValueHidden": false, "sourceText": "Izlenmeli" },
          { "optionType": "label", "value": "Servis Kontrolu Onerilir", "label": "Servis Kontrolu Onerilir", "displayLabel": "Servis Kontrolu Onerilir", "needsLabelMap": false, "disabled": false, "rawValueHidden": false, "sourceText": "Servis Kontrolu Onerilir" },
          { "optionType": "label", "value": "Kritik Problem Var", "label": "Kritik Problem Var", "displayLabel": "Kritik Problem Var", "needsLabelMap": false, "disabled": false, "rawValueHidden": false, "sourceText": "Kritik Problem Var" }
        ],
        "inputs": [],
        "hasDescription": true,
        "noteEnabled": true,
        "photoSlots": 0,
        "photos": [],
        "required": true,
        "source": "ototr_road_test_v1",
        "excludedFromPrecheck": false,
        "completed": false,
        "optionCount": 4,
        "labeledOptionCount": 4,
        "placeholderOptionCount": 0,
        "uiHints": { "requiresEvidenceOnCritical": true, "defaultEvidenceSlots": 0, "showDescriptionField": true, "hasUnknownCheckboxLabels": false, "criticalOptionCountHeuristic": 2 }
      }
    ]
  }
]);

export const OTOTR_EXPERTISE_TEST_TOTALS = Object.freeze({
  moduleCount: OTOTR_EXPERTISE_TEST_MODULES.length,
  itemCount: OTOTR_EXPERTISE_TEST_MODULES.reduce((sum, module) => sum + module.items.length, 0),
  optionCount: OTOTR_EXPERTISE_TEST_MODULES.reduce((sum, module) => sum + module.items.reduce((itemSum, item) => itemSum + item.options.length, 0), 0)
});
