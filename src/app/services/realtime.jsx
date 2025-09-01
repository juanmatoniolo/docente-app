// src/services/realtime.js
import { getApp } from "firebase/app";
import {
    getDatabase, ref, set, update, push, get, remove, onValue, serverTimestamp
} from "firebase/database";

// Usa la app ya inicializada en tu proyecto (no re-inicializa)
const db = getDatabase(getApp());

// YYYY-MM-DD en hora local de Argentina (evita confusiones con UTC)
export function dateKey(d = new Date(), timeZone = "America/Argentina/Cordoba") {
    const f = new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" });
    return f.format(d); // "2025-08-29"
}
