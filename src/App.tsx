/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Share2, Trophy, ShoppingBag, LogIn, LogOut, Coins, User as UserIcon, Globe, Music, Mic, CreditCard } from 'lucide-react';
import { auth, db } from './firebase';
import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, collection, query, orderBy, limit, onSnapshot, serverTimestamp, increment } from 'firebase/firestore';

// --- Localization ---
const TRANSLATIONS = {
    en: {
        play: 'PLAY', shop: 'SHOP', leaderboard: 'LEADERBOARD', login: 'Login with Google', logout: 'Logout',
        score: 'SCORE', bestScore: 'Best Score', gameOver: 'GAME OVER', retry: 'Retry', menu: 'Menu', share: 'Share',
        tutorialPrompt: 'Welcome Ninja! Tap to jump between walls and dodge obstacles.', startTutorial: 'Start Tutorial', skip: 'Skip',
        shopTitle: 'Ninja Shop', customize: 'Customize your ninja!', skins: 'Skins', audio: 'Audio', coins: 'Coins',
        buy: 'Unlock', use: 'Use', selected: 'Selected', loginToSave: 'Login to unlock and save items.',
        bundles: 'Coin Bundles', buyBundle: 'Buy', processing: 'Processing...', success: 'Success!',
        deathPhrases: 'Death Phrases', music: 'Music Tracks',
        difficulty: 'Difficulty', easy: 'Easy', normal: 'Normal', hard: 'Hard',
        dailyChallenge: 'Daily Challenge', reward: 'Reward', completed: 'Completed!',
        powerupInvincible: 'INVINCIBLE!', powerupMultiplier: '2X SCORE!', powerupSlowMo: 'SLOW MOTION!'
    },
    it: {
        play: 'GIOCA', shop: 'NEGOZIO', leaderboard: 'CLASSIFICA', login: 'Accedi con Google', logout: 'Esci',
        score: 'PUNTEGGIO', bestScore: 'Miglior Punteggio', gameOver: 'GAME OVER', retry: 'Riprova', menu: 'Menu', share: 'Condividi',
        tutorialPrompt: 'Benvenuto Ninja! Tocca per saltare tra i muri e schivare gli ostacoli.', startTutorial: 'Inizia Tutorial', skip: 'Salta',
        shopTitle: 'Negozio Ninja', customize: 'Personalizza il tuo ninja!', skins: 'Skin', audio: 'Audio', coins: 'Monete',
        buy: 'Sblocca', use: 'Usa', selected: 'Selezionato', loginToSave: 'Accedi per sbloccare e salvare.',
        bundles: 'Pacchetti Monete', buyBundle: 'Acquista', processing: 'Elaborazione...', success: 'Completato!',
        deathPhrases: 'Frasi di Morte', music: 'Tracce Musicali',
        difficulty: 'Difficoltà', easy: 'Facile', normal: 'Normale', hard: 'Difficile',
        dailyChallenge: 'Sfida Giornaliera', reward: 'Ricompensa', completed: 'Completata!',
        powerupInvincible: 'INVINCIBILE!', powerupMultiplier: 'PUNTEGGIO 2X!', powerupSlowMo: 'RALLENTATORE!'
    },
    fr: {
        play: 'JOUER', shop: 'BOUTIQUE', leaderboard: 'CLASSEMENT', login: 'Connexion Google', logout: 'Déconnexion',
        score: 'SCORE', bestScore: 'Meilleur Score', gameOver: 'FIN DE PARTIE', retry: 'Réessayer', menu: 'Menu', share: 'Partager',
        tutorialPrompt: 'Bienvenue Ninja! Touchez pour sauter entre les murs et esquiver les obstacles.', startTutorial: 'Tutoriel', skip: 'Passer',
        shopTitle: 'Boutique Ninja', customize: 'Personnalisez votre ninja!', skins: 'Apparences', audio: 'Audio', coins: 'Pièces',
        buy: 'Débloquer', use: 'Utiliser', selected: 'Sélectionné', loginToSave: 'Connectez-vous pour sauvegarder.',
        bundles: 'Packs de Pièces', buyBundle: 'Acheter', processing: 'Traitement...', success: 'Succès!',
        deathPhrases: 'Phrases de Mort', music: 'Musiques',
        difficulty: 'Difficulté', easy: 'Facile', normal: 'Normal', hard: 'Difficile',
        dailyChallenge: 'Défi Quotidien', reward: 'Récompense', completed: 'Terminé!',
        powerupInvincible: 'INVINCIBLE!', powerupMultiplier: 'SCORE 2X!', powerupSlowMo: 'RALENTI!'
    },
    es: {
        play: 'JUGAR', shop: 'TIENDA', leaderboard: 'CLASIFICACIÓN', login: 'Iniciar con Google', logout: 'Salir',
        score: 'PUNTUACIÓN', bestScore: 'Mejor Puntuación', gameOver: 'FIN DEL JUEGO', retry: 'Reintentar', menu: 'Menú', share: 'Compartir',
        tutorialPrompt: '¡Bienvenido Ninja! Toca para saltar entre paredes y esquivar obstáculos.', startTutorial: 'Tutorial', skip: 'Omitir',
        shopTitle: 'Tienda Ninja', customize: '¡Personaliza tu ninja!', skins: 'Aspectos', audio: 'Audio', coins: 'Monedas',
        buy: 'Desbloquear', use: 'Usar', selected: 'Seleccionado', loginToSave: 'Inicia sesión para guardar.',
        bundles: 'Paquetes de Monedas', buyBundle: 'Comprar', processing: 'Procesando...', success: '¡Éxito!',
        deathPhrases: 'Frases de Muerte', music: 'Música',
        difficulty: 'Dificultad', easy: 'Fácil', normal: 'Normal', hard: 'Difícil',
        dailyChallenge: 'Reto Diario', reward: 'Recompensa', completed: '¡Completado!',
        powerupInvincible: '¡INVENCIBLE!', powerupMultiplier: '¡PUNTUACIÓN 2X!', powerupSlowMo: '¡CÁMARA LENTA!'
    },
    de: {
        play: 'SPIELEN', shop: 'LADEN', leaderboard: 'RANGLISTE', login: 'Mit Google anmelden', logout: 'Abmelden',
        score: 'PUNKTZAHL', bestScore: 'Beste Punktzahl', gameOver: 'SPIEL VORBEI', retry: 'Wiederholen', menu: 'Menü', share: 'Teilen',
        tutorialPrompt: 'Willkommen Ninja! Tippe, um zwischen Wänden zu springen und Hindernissen auszuweichen.', startTutorial: 'Tutorial Starten', skip: 'Überspringen',
        shopTitle: 'Ninja Laden', customize: 'Passe deinen Ninja an!', skins: 'Skins', audio: 'Audio', coins: 'Münzen',
        buy: 'Freischalten', use: 'Benutzen', selected: 'Ausgewählt', loginToSave: 'Anmelden zum Speichern.',
        bundles: 'Münzpakete', buyBundle: 'Kaufen', processing: 'Verarbeitung...', success: 'Erfolg!',
        deathPhrases: 'Todesphrasen', music: 'Musik',
        difficulty: 'Schwierigkeit', easy: 'Leicht', normal: 'Normal', hard: 'Schwer',
        dailyChallenge: 'Tägliche Herausforderung', reward: 'Belohnung', completed: 'Abgeschlossen!',
        powerupInvincible: 'UNBESIEGBAR!', powerupMultiplier: '2X PUNKTE!', powerupSlowMo: 'ZEITLUPE!'
    }
};
type Language = keyof typeof TRANSLATIONS;

// --- Error Handling ---
enum OperationType {
  CREATE = 'create', UPDATE = 'update', DELETE = 'delete', LIST = 'list', GET = 'get', WRITE = 'write',
}
interface FirestoreErrorInfo {
  error: string; operationType: OperationType; path: string | null;
  authInfo: any;
}
function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid, email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified, isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType, path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-screen bg-slate-950 text-white p-8 text-center">
          <div>
            <h1 className="text-3xl text-red-500 font-bold mb-4">Something went wrong.</h1>
            <p className="text-slate-400 max-w-md mx-auto">{this.state.error?.message}</p>
            <button onClick={() => window.location.reload()} className="mt-6 bg-slate-800 px-6 py-2 rounded-lg">Reload</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

type GameState = 'LOADING' | 'TUTORIAL_PROMPT' | 'TUTORIAL_PLAYING' | 'START' | 'PLAYING' | 'GAME_OVER' | 'LEADERBOARD' | 'SHOP';

interface UserProfile {
    uid: string;
    displayName: string;
    photoURL: string;
    highScore: number;
    coins: number;
    unlockedSkins: string[];
    selectedSkin: string;
    unlockedDeathPhrases: string[];
    selectedDeathPhrase: string;
    unlockedMusic: string[];
    selectedMusic: string;
}

interface LeaderboardEntry {
    uid: string;
    displayName: string;
    photoURL: string;
    score: number;
    timestamp: number;
}

const SKINS = [
    { id: 'default', name: 'Ninja Base', price: 0, color: '#e11d48' },
    { id: 'blue', name: 'Ninja Acqua', price: 50, color: '#3b82f6' },
    { id: 'green', name: 'Ninja Foresta', price: 100, color: '#10b981' },
    { id: 'gold', name: 'Ninja Oro', price: 500, color: '#eab308' },
    { id: 'purple', name: 'Ninja Ombra', price: 1000, color: '#a855f7' },
];

const DEATH_PHRASES = [
    { id: 'default', name: 'You are dead', price: 0, text: 'you are dead' },
    { id: 'wasted', name: 'Wasted', price: 200, text: 'wasted' },
    { id: 'oof', name: 'Oof', price: 300, text: 'oof' },
    { id: 'try_again', name: 'Try Again', price: 150, text: 'try again' },
];

const MUSIC_TRACKS = [
    { id: 'default', name: 'Classic 8-bit', price: 0 },
    { id: 'synthwave', name: 'Synthwave', price: 400 },
    { id: 'rock', name: 'Ninja Rock', price: 600 },
];

const COIN_BUNDLES = [
    { id: 'starter', name: 'Starter Pack', coins: 1000, price: '€0.99' },
    { id: 'pro', name: 'Pro Pack', coins: 5000, price: '€2.99' },
    { id: 'master', name: 'Ninja Master Pack', coins: 15000, price: '€5.99' },
];

class AudioController {
    ctx: AudioContext | null = null;
    musicInterval: number | null = null;
    isPlayingMusic: boolean = false;
    noteIndex: number = 0;
    
    musicTrack: string = 'default';
    deathPhrase: string = 'you are dead';

    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    playTone(freq: number, type: OscillatorType, duration: number, vol: number = 0.1, slideFreq?: number) {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        if (slideFreq) {
            osc.frequency.exponentialRampToValueAtTime(slideFreq, this.ctx.currentTime + duration);
        }
        
        gain.gain.setValueAtTime(vol, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
        
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }

    playJump() {
        this.init();
        this.playTone(150, 'square', 0.2, 0.05, 600);
    }

    playScore() {
        this.init();
        this.playTone(800, 'sine', 0.1, 0.05, 1200);
    }

    playGameOver() {
        this.init();
        this.playTone(300, 'sawtooth', 0.5, 0.1, 50);
    }

    playVoiceOver() {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(this.deathPhrase);
            utterance.lang = 'en-US';
            utterance.pitch = 0.3;
            utterance.rate = 0.8;
            utterance.volume = 1;
            window.speechSynthesis.speak(utterance);
        }
    }

    startMusic(getSpeed: () => number) {
        this.init();
        if (this.isPlayingMusic) return;
        this.isPlayingMusic = true;
        
        let notes = [220, 220, 330, 220, 261.63, 220, 196, 220];
        let type: OscillatorType = 'square';

        if (this.musicTrack === 'synthwave') {
            notes = [110, 110, 164.81, 110, 130.81, 110, 98, 110];
            type = 'sawtooth';
        } else if (this.musicTrack === 'rock') {
            notes = [164.81, 196, 220, 164.81, 261.63, 220, 196, 164.81];
            type = 'triangle';
        }
        
        const playNextNote = () => {
            if (!this.isPlayingMusic || !this.ctx) return;
            const freq = notes[this.noteIndex % notes.length];
            this.playTone(freq / 2, type, 0.1, 0.02);
            this.noteIndex++;
            
            const speed = getSpeed();
            const delay = Math.max(80, 250 - (speed * 10));
            this.musicInterval = window.setTimeout(playNextNote, delay);
        };
        
        playNextNote();
    }

    stopMusic() {
        this.isPlayingMusic = false;
        if (this.musicInterval) {
            clearTimeout(this.musicInterval);
        }
    }
}

class GameEngine {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    audio: AudioController = new AudioController();
    setScore!: (s: number) => void;
    onGameOver!: (s: number, coins: number, dodged: number) => void;
    onTutorialComplete!: () => void;
    onCoinCollected!: () => void;
    onPowerUpCollected!: (type: string) => void;
    onPowerUpExpired!: () => void;
    
    running: boolean = false;
    isDead: boolean = false;
    isTutorial: boolean = false;
    animationFrameId: number = 0;

    ninja = { x: 100, y: 360, lane: 'BOTTOM', isJumping: false, targetLane: 'BOTTOM', color: '#e11d48' };
    trail: {x: number, y: number}[] = [];
    obstacles: any[] = [];
    powerups: any[] = [];
    particles: any[] = [];
    speed = 6;
    baseSpeed = 6;
    score = 0;
    sessionCoins = 0;
    dodgedObstacles = 0;
    spawnTimer = 100;
    powerupTimer = 200;
    tutorialObstacleSpawned = false;
    tutorialSuccess = false;
    tutorialSuccessTimer = 0;
    
    difficulty: 'EASY' | 'NORMAL' | 'HARD' = 'NORMAL';
    activePowerUp: { type: 'INVINCIBILITY' | 'MULTIPLIER' | 'SLOW_MO', timeLeft: number } | null = null;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d')!;
        this.draw();
    }

    setCallbacks(setScore: (s: number) => void, onGameOver: (s: number, coins: number, dodged: number) => void, onTutorialComplete: () => void, onCoinCollected: () => void, onPowerUpCollected: (type: string) => void, onPowerUpExpired: () => void) {
        this.setScore = setScore;
        this.onGameOver = onGameOver;
        this.onTutorialComplete = onTutorialComplete;
        this.onCoinCollected = onCoinCollected;
        this.onPowerUpCollected = onPowerUpCollected;
        this.onPowerUpExpired = onPowerUpExpired;
    }

    setNinjaColor(color: string) {
        this.ninja.color = color;
    }

    setAudioConfig(musicTrack: string, deathPhrase: string) {
        this.audio.musicTrack = musicTrack;
        this.audio.deathPhrase = deathPhrase;
    }

    start(isTutorial = false, difficulty: 'EASY' | 'NORMAL' | 'HARD' = 'NORMAL') {
        this.isTutorial = isTutorial;
        this.difficulty = difficulty;
        this.ninja = { ...this.ninja, x: 100, y: 360, lane: 'BOTTOM', isJumping: false, targetLane: 'BOTTOM' };
        this.trail = [];
        this.obstacles = [];
        this.powerups = [];
        this.particles = [];
        this.activePowerUp = null;
        
        this.baseSpeed = difficulty === 'EASY' ? 5 : difficulty === 'NORMAL' ? 7 : 10;
        this.speed = this.baseSpeed;
        
        this.score = 0;
        this.sessionCoins = 0;
        this.dodgedObstacles = 0;
        this.spawnTimer = 100;
        this.powerupTimer = 300;
        this.tutorialObstacleSpawned = false;
        this.tutorialSuccess = false;
        this.running = true;
        this.isDead = false;
        
        this.audio.startMusic(() => this.speed);
        
        if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
        this.loop();
    }

    stop() {
        this.running = false;
        this.audio.stopMusic();
        if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    }

    tap() {
        this.audio.init();
        if (!this.ninja.isJumping && !this.tutorialSuccess) {
            this.ninja.isJumping = true;
            this.ninja.targetLane = this.ninja.lane === 'BOTTOM' ? 'TOP' : 'BOTTOM';
            this.createParticles(this.ninja.x + 20, this.ninja.y + 20, this.ninja.color, 8, this.ninja.targetLane === 'TOP' ? 1 : -1);
            this.audio.playJump();
        }
    }
    
    createParticles(x: number, y: number, color: string, count: number, dirY: number = 0, spread: number = 10, life: number = 1, decay: number = 0.05) {
        for(let i=0; i<count; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * spread,
                vy: dirY !== 0 ? dirY * (Math.random() * 5 + 5) : (Math.random() - 0.5) * spread,
                life: life,
                decay: decay,
                color: color
            });
        }
    }

    update() {
        if (!this.running) return;

        if (this.tutorialSuccess) {
            this.tutorialSuccessTimer--;
            if (this.tutorialSuccessTimer <= 0) {
                this.running = false;
                this.audio.stopMusic();
                this.onTutorialComplete();
                return;
            }
        }

        // Update ninja
        if (!this.isDead) {
            this.trail.push({x: this.ninja.x, y: this.ninja.y});
            if (this.trail.length > 10) this.trail.shift();
        }

        if (!this.isDead && this.ninja.isJumping) {
            const jumpSpeed = 25;
            if (this.ninja.targetLane === 'TOP') {
                this.ninja.y -= jumpSpeed;
                if (this.ninja.y <= 50) {
                    this.ninja.y = 50;
                    this.ninja.isJumping = false;
                    this.ninja.lane = 'TOP';
                }
            } else {
                this.ninja.y += jumpSpeed;
                if (this.ninja.y >= 360) {
                    this.ninja.y = 360;
                    this.ninja.isJumping = false;
                    this.ninja.lane = 'BOTTOM';
                }
            }
        }
        
        // Update particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            let p = this.particles[i];
            p.x += p.vx - (this.isDead ? 0 : this.speed);
            p.y += p.vy;
            p.life -= p.decay || 0.05;
            if (p.life <= 0) this.particles.splice(i, 1);
        }

        if (this.isDead) return;

        if (!this.tutorialSuccess) {
            // Power-up logic
            let currentSpeed = this.speed;
            if (this.activePowerUp) {
                this.activePowerUp.timeLeft -= 16; // approx 16ms per frame
                if (this.activePowerUp.timeLeft <= 0) {
                    this.activePowerUp = null;
                    this.onPowerUpExpired();
                } else if (this.activePowerUp.type === 'SLOW_MO') {
                    currentSpeed *= 0.5;
                }
            }

            // Spawn obstacles
            this.spawnTimer--;
            if (this.spawnTimer <= 0) {
                if (this.isTutorial) {
                    if (!this.tutorialObstacleSpawned) {
                        this.spawnObstacle();
                        this.tutorialObstacleSpawned = true;
                    }
                } else {
                    this.spawnObstacle();
                    const diffMultiplier = this.difficulty === 'EASY' ? 1.5 : this.difficulty === 'HARD' ? 0.7 : 1;
                    const maxTimer = Math.max(30, (90 - this.score * 2) * diffMultiplier);
                    const minTimer = Math.max(15, (40 - this.score) * diffMultiplier);
                    this.spawnTimer = Math.random() * (maxTimer - minTimer) + minTimer;
                }
            }

            // Spawn powerups
            if (!this.isTutorial) {
                this.powerupTimer--;
                if (this.powerupTimer <= 0) {
                    this.spawnPowerup();
                    this.powerupTimer = Math.random() * 400 + 300;
                }
            }

            // Update powerups
            for (let i = this.powerups.length - 1; i >= 0; i--) {
                let p = this.powerups[i];
                p.x -= currentSpeed;
                p.time += 0.1;

                if (this.checkCollision(this.ninja, p)) {
                    if (p.isCoin) {
                        this.createParticles(p.x + 10, p.y + 10, '#eab308', 15);
                        this.sessionCoins++;
                        this.onCoinCollected();
                        this.audio.playTone(1200, 'sine', 0.1, 0.05, 1500);
                    } else {
                        this.createParticles(p.x + 10, p.y + 10, p.color, 30);
                        this.activePowerUp = { type: p.type, timeLeft: 8000 }; // 8 seconds
                        this.onPowerUpCollected(p.type);
                        this.audio.playTone(800, 'square', 0.2, 0.1, 1000);
                    }
                    this.powerups.splice(i, 1);
                    continue;
                }

                if (p.x + p.width < 0) {
                    this.powerups.splice(i, 1);
                }
            }

            // Update obstacles
            for (let i = this.obstacles.length - 1; i >= 0; i--) {
                let obs = this.obstacles[i];
                obs.x -= currentSpeed;
                if (obs.vx) obs.x += obs.vx;
                if (obs.vy) {
                    obs.y += obs.vy;
                    if (obs.y < 50 || obs.y + obs.height > 400) {
                        obs.vy *= -1;
                    }
                }
                obs.time += 0.1;

                // Check collision
                if (this.checkCollision(this.ninja, obs)) {
                    if (this.activePowerUp?.type === 'INVINCIBILITY') {
                        // Destroy obstacle
                        this.createParticles(obs.x + 20, obs.y + 20, '#94a3b8', 20);
                        this.obstacles.splice(i, 1);
                        this.audio.playTone(300, 'sawtooth', 0.1, 0.1, 100);
                        continue;
                    } else {
                        this.createParticles(this.ninja.x + 20, this.ninja.y + 20, '#ef4444', 40, 0, 25, 1.5, 0.02);
                        this.createParticles(this.ninja.x + 20, this.ninja.y + 20, '#f97316', 30, 0, 20, 1.2, 0.02);
                        this.createParticles(this.ninja.x + 20, this.ninja.y + 20, '#facc15', 20, 0, 15, 1.0, 0.03);
                        this.isDead = true;
                        this.audio.stopMusic();
                        this.audio.playGameOver();
                        this.audio.playVoiceOver();
                        this.onGameOver(this.score, this.sessionCoins, this.dodgedObstacles);
                        return;
                    }
                }

                // Check passed
                if (!obs.passed && obs.x + obs.width < this.ninja.x) {
                    obs.passed = true;
                    this.dodgedObstacles++;
                    const scoreGain = this.activePowerUp?.type === 'MULTIPLIER' ? 2 : 1;
                    this.score += scoreGain;
                    this.setScore(this.score);
                    
                    const maxSpeed = this.difficulty === 'EASY' ? 12 : this.difficulty === 'HARD' ? 20 : 15;
                    const speedInc = this.difficulty === 'EASY' ? 0.1 : this.difficulty === 'HARD' ? 0.25 : 0.15;
                    this.speed = Math.min(this.speed + speedInc, maxSpeed);
                    
                    this.audio.playScore();
                    this.createParticles(obs.x + 20, obs.y + 20, '#94a3b8', 5);

                    if (this.isTutorial) {
                        this.tutorialSuccess = true;
                        this.tutorialSuccessTimer = 60; // 1 second pause
                    }
                }

                if (obs.x + obs.width < 0) {
                    this.obstacles.splice(i, 1);
                }
            }
        }
    }

    checkCollision(ninja: any, obs: any) {
        const hitboxPadding = 8;
        const nx = ninja.x + hitboxPadding;
        const ny = ninja.y + hitboxPadding;
        const nw = 40 - hitboxPadding * 2;
        const nh = 40 - hitboxPadding * 2;

        const ox = obs.x + hitboxPadding;
        const oy = obs.y + hitboxPadding;
        const ow = obs.width - hitboxPadding * 2;
        const oh = obs.height - hitboxPadding * 2;

        return nx < ox + ow &&
               nx + nw > ox &&
               ny < oy + oh &&
               ny + nh > oy;
    }

    spawnObstacle() {
        const types = ['SPIKES', 'FIRE', 'TRAP', 'SHURIKEN', 'MOVING_BLOCK'];
        const type = types[Math.floor(Math.random() * types.length)];
        const lane = Math.random() > 0.5 ? 'TOP' : 'BOTTOM';
        let y = lane === 'TOP' ? 50 : 360;
        let width = 40;
        let height = 40;
        let vx = 0;
        let vy = 0;

        if (type === 'SHURIKEN') {
            y = 100 + Math.random() * 200;
            vx = -3;
            width = 30;
            height = 30;
        } else if (type === 'MOVING_BLOCK') {
            y = 200;
            vy = Math.random() > 0.5 ? 2 : -2;
        }

        this.obstacles.push({
            x: 800,
            y: y,
            width: width,
            height: height,
            type: type,
            lane: lane,
            passed: false,
            vx: vx,
            vy: vy,
            time: 0
        });
    }

    spawnPowerup() {
        const lane = Math.random() > 0.5 ? 'TOP' : 'BOTTOM';
        const y = lane === 'TOP' ? 60 : 370;
        
        const isCoin = Math.random() > 0.3; // 70% chance for coin, 30% for powerup
        
        if (isCoin) {
            this.powerups.push({
                x: 800, y: y, width: 20, height: 20, time: 0, isCoin: true
            });
        } else {
            const types: ('INVINCIBILITY' | 'MULTIPLIER' | 'SLOW_MO')[] = ['INVINCIBILITY', 'MULTIPLIER', 'SLOW_MO'];
            const type = types[Math.floor(Math.random() * types.length)];
            const color = type === 'INVINCIBILITY' ? '#fbbf24' : type === 'MULTIPLIER' ? '#c084fc' : '#22d3ee';
            this.powerups.push({
                x: 800, y: y, width: 24, height: 24, time: 0, isCoin: false, type, color
            });
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw background
        this.ctx.fillStyle = '#0f172a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw grid lines
        this.ctx.strokeStyle = '#1e293b';
        this.ctx.lineWidth = 2;
        const offset = (Date.now() / 20 * this.speed) % 100;
        for(let i=0; i<10; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i*100 - offset, 50);
            this.ctx.lineTo(i*100 - offset, 400);
            this.ctx.stroke();
        }

        // Draw floor and ceiling
        this.ctx.fillStyle = '#334155';
        this.ctx.fillRect(0, 0, this.canvas.width, 50);
        this.ctx.fillRect(0, 400, this.canvas.width, 50);
        
        // Draw borders
        this.ctx.fillStyle = '#475569';
        this.ctx.fillRect(0, 48, this.canvas.width, 4);
        this.ctx.fillRect(0, 398, this.canvas.width, 4);

        // Draw particles
        for (let p of this.particles) {
            this.ctx.fillStyle = p.color;
            this.ctx.globalAlpha = Math.max(0, Math.min(1, p.life));
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = p.color;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.shadowBlur = 0;
        }
        this.ctx.globalAlpha = 1;

        // Draw powerups
        for (let p of this.powerups) {
            this.ctx.save();
            this.ctx.translate(p.x + p.width/2, p.y + p.height/2);
            const scale = 1 + Math.sin(p.time * 5) * 0.2;
            this.ctx.scale(scale, scale);
            
            if (p.isCoin) {
                this.ctx.fillStyle = '#eab308';
                this.ctx.shadowBlur = 15;
                this.ctx.shadowColor = '#eab308';
                this.ctx.beginPath();
                this.ctx.arc(0, 0, 10, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.fillStyle = '#fef08a';
                this.ctx.shadowBlur = 0;
                this.ctx.beginPath();
                this.ctx.arc(-2, -2, 4, 0, Math.PI * 2);
                this.ctx.fill();
            } else {
                this.ctx.fillStyle = p.color;
                this.ctx.shadowBlur = 20;
                this.ctx.shadowColor = p.color;
                this.ctx.beginPath();
                this.ctx.rect(-12, -12, 24, 24);
                this.ctx.fill();
                this.ctx.shadowBlur = 0;
                this.ctx.fillStyle = '#fff';
                this.ctx.font = 'bold 14px sans-serif';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText(p.type === 'INVINCIBILITY' ? '★' : p.type === 'MULTIPLIER' ? '2X' : '⏱', 0, 0);
            }
            this.ctx.restore();
        }

        // Draw obstacles
        for (let obs of this.obstacles) {
            this.drawObstacle(this.ctx, obs);
        }

        // Draw ninja trail
        if (!this.isDead) {
            this.trail.forEach((pos, i) => {
                this.ctx.save();
                this.ctx.translate(pos.x + 20, pos.y + 20);
                this.ctx.globalAlpha = (i / this.trail.length) * 0.5;
                this.ctx.fillStyle = this.ninja.color;
                this.ctx.fillRect(-16, -16, 32, 32);
                this.ctx.restore();
            });
            this.ctx.globalAlpha = 1;
            
            // Draw ninja with active powerup glow
            if (this.activePowerUp) {
                this.ctx.shadowBlur = 20;
                this.ctx.shadowColor = this.activePowerUp.type === 'INVINCIBILITY' ? '#fbbf24' : this.activePowerUp.type === 'MULTIPLIER' ? '#c084fc' : '#22d3ee';
            }
            this.drawNinja(this.ctx, this.ninja.x, this.ninja.y, this.ninja.isJumping, this.ninja.lane);
            this.ctx.shadowBlur = 0;
        }

        if (this.tutorialSuccess) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = '#10b981';
            this.ctx.font = '900 48px sans-serif';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('OTTIMO!', this.canvas.width / 2, this.canvas.height / 2);
        }
    }

    drawNinja(ctx: CanvasRenderingContext2D, x: number, y: number, isJumping: boolean, lane: string) {
        ctx.save();
        ctx.translate(x + 20, y + 20);
        
        if (lane === 'TOP' && !isJumping) {
            ctx.scale(1, -1);
        }
        
        if (isJumping) {
            const rotation = (y - 50) / (360 - 50) * Math.PI;
            ctx.rotate(this.ninja.targetLane === 'TOP' ? -rotation : rotation);
        } else {
            const bob = Math.sin(Date.now() / 50) * 3;
            ctx.translate(0, bob);
        }

        // Body
        ctx.fillStyle = '#09090b';
        ctx.beginPath();
        if (ctx.roundRect) {
            ctx.roundRect(-16, -16, 32, 32, 8);
        } else {
            ctx.fillRect(-16, -16, 32, 32);
        }
        ctx.fill();
        
        // Headband
        ctx.fillStyle = this.ninja.color;
        ctx.fillRect(-16, -8, 32, 8);
        
        // Headband tails
        const tailWave = Math.sin(Date.now() / 100) * 5;
        ctx.beginPath();
        ctx.moveTo(-16, -4);
        ctx.quadraticCurveTo(-25, -4 + tailWave, -30, -8 + tailWave);
        ctx.lineTo(-30, -2 + tailWave);
        ctx.quadraticCurveTo(-25, 0 + tailWave, -16, 0);
        ctx.fill();

        // Eyes
        ctx.fillStyle = 'white';
        ctx.fillRect(4, -6, 8, 4);
        ctx.fillStyle = '#09090b';
        ctx.fillRect(8, -6, 2, 4);

        ctx.restore();
    }

    drawObstacle(ctx: CanvasRenderingContext2D, obs: any) {
        ctx.save();
        ctx.translate(obs.x, obs.y);
        
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#ef4444';

        if (obs.type === 'SHURIKEN') {
            ctx.translate(obs.width/2, obs.height/2);
            ctx.rotate(obs.time * 2);
            ctx.fillStyle = '#cbd5e1';
            ctx.beginPath();
            ctx.moveTo(0, -15); ctx.lineTo(5, -5); ctx.lineTo(15, 0);
            ctx.lineTo(5, 5); ctx.lineTo(0, 15); ctx.lineTo(-5, 5);
            ctx.lineTo(-15, 0); ctx.lineTo(-5, -5);
            ctx.fill();
            ctx.fillStyle = '#0f172a';
            ctx.beginPath();
            ctx.arc(0, 0, 3, 0, Math.PI*2);
            ctx.fill();
            ctx.restore();
            return;
        }

        if (obs.type === 'MOVING_BLOCK') {
            ctx.fillStyle = '#64748b';
            ctx.fillRect(0, 0, obs.width, obs.height);
            ctx.fillStyle = '#475569';
            ctx.fillRect(5, 5, obs.width-10, obs.height-10);
            ctx.restore();
            return;
        }

        if (obs.lane === 'TOP') {
            ctx.translate(0, 40);
            ctx.scale(1, -1);
        }

        if (obs.type === 'SPIKES') {
            const spikeY = Math.max(0, Math.sin(obs.time) * 10);
            ctx.translate(0, spikeY);
            
            ctx.fillStyle = '#94a3b8';
            ctx.beginPath();
            ctx.moveTo(0, 40); ctx.lineTo(10, 10); ctx.lineTo(20, 40);
            ctx.moveTo(20, 40); ctx.lineTo(30, 10); ctx.lineTo(40, 40);
            ctx.fill();
            
            ctx.fillStyle = '#cbd5e1';
            ctx.beginPath();
            ctx.moveTo(10, 10); ctx.lineTo(15, 40); ctx.lineTo(20, 40);
            ctx.moveTo(30, 10); ctx.lineTo(35, 40); ctx.lineTo(40, 40);
            ctx.fill();
            
        } else if (obs.type === 'FIRE') {
            const flicker = Math.random() * 15;
            const wave = Math.sin(obs.time * 5) * 5;
            ctx.fillStyle = '#ea580c';
            ctx.beginPath();
            ctx.moveTo(0, 40);
            ctx.quadraticCurveTo(10 + wave, 10 + flicker, 20, 0);
            ctx.quadraticCurveTo(30 - wave, 10 + flicker, 40, 40);
            ctx.fill();
            
            ctx.fillStyle = '#facc15';
            ctx.beginPath();
            ctx.moveTo(10, 40);
            ctx.quadraticCurveTo(20 + wave/2, 20 + flicker/2, 20, 10);
            ctx.quadraticCurveTo(20 - wave/2, 20 + flicker/2, 30, 40);
            ctx.fill();
            
        } else if (obs.type === 'TRAP') {
            const isSnapping = Math.sin(obs.time * 2) > 0;
            
            ctx.fillStyle = '#334155';
            ctx.fillRect(0, 30, 40, 10);
            
            ctx.fillStyle = '#94a3b8';
            for(let i=0; i<4; i++) {
                ctx.beginPath();
                ctx.moveTo(i*10, 30);
                if (isSnapping) {
                    ctx.lineTo(i*10 + 5, 25);
                } else {
                    ctx.lineTo(i*10 + 5, 10);
                }
                ctx.lineTo(i*10 + 10, 30);
                ctx.fill();
            }
        }

        ctx.restore();
    }

    loop = () => {
        this.update();
        this.draw();
        if (this.running) {
            this.animationFrameId = requestAnimationFrame(this.loop);
        }
    }
}

export default function App() {
    const [gameState, setGameState] = useState<GameState>('LOADING');
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);
    const [coins, setCoins] = useState(0);
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [lang, setLang] = useState<Language>('en');
    const [shopTab, setShopTab] = useState<'skins' | 'audio' | 'coins'>('skins');
    const [isProcessing, setIsProcessing] = useState(false);
    const [difficulty, setDifficulty] = useState<'EASY' | 'NORMAL' | 'HARD'>('NORMAL');
    const [activePowerUp, setActivePowerUp] = useState<string | null>(null);
    const [dailyChallenge, setDailyChallenge] = useState<{desc: string, target: number, progress: number, reward: number, completed: boolean, type: string} | null>(null);
    
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const engineRef = useRef<GameEngine | null>(null);

    const t = TRANSLATIONS[lang];

    // Detect language on mount
    useEffect(() => {
        const browserLang = navigator.language.split('-')[0];
        if (Object.keys(TRANSLATIONS).includes(browserLang)) {
            setLang(browserLang as Language);
        }
        
        // Setup Daily Challenge
        const today = new Date().toDateString();
        const savedChallenge = localStorage.getItem('ninja_daily_' + today);
        if (savedChallenge) {
            setDailyChallenge(JSON.parse(savedChallenge));
        } else {
            const challenges = [
                { desc: 'Collect 20 coins in one run', target: 20, reward: 50, type: 'coins' },
                { desc: 'Reach score 50', target: 50, reward: 100, type: 'score' },
                { desc: 'Dodge 50 obstacles', target: 50, reward: 75, type: 'dodge' }
            ];
            const random = challenges[Math.floor(Math.random() * challenges.length)];
            const newChallenge = { ...random, progress: 0, completed: false };
            localStorage.setItem('ninja_daily_' + today, JSON.stringify(newChallenge));
            setDailyChallenge(newChallenge);
        }
    }, []);

    // Auth & Profile Listener
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                try {
                    const userRef = doc(db, 'users', currentUser.uid);
                    const docSnap = await getDoc(userRef);
                    if (docSnap.exists()) {
                        const data = docSnap.data() as UserProfile;
                        setProfile(data);
                        setHighScore(data.highScore);
                        setCoins(data.coins);
                        if (engineRef.current) {
                            const skin = SKINS.find(s => s.id === data.selectedSkin);
                            if (skin) engineRef.current.setNinjaColor(skin.color);
                            engineRef.current.setAudioConfig(data.selectedMusic || 'default', data.selectedDeathPhrase || 'you are dead');
                        }
                    } else {
                        const newProfile: UserProfile = {
                            uid: currentUser.uid,
                            displayName: currentUser.displayName || 'Ninja Anonimo',
                            photoURL: currentUser.photoURL || '',
                            highScore: 0,
                            coins: 0,
                            unlockedSkins: ['default'],
                            selectedSkin: 'default',
                            unlockedDeathPhrases: ['default'],
                            selectedDeathPhrase: 'you are dead',
                            unlockedMusic: ['default'],
                            selectedMusic: 'default'
                        };
                        await setDoc(userRef, newProfile);
                        setProfile(newProfile);
                    }
                } catch (error) {
                    handleFirestoreError(error, OperationType.GET, 'users');
                }
            } else {
                setProfile(null);
                // Load local fallback
                const savedHighScore = localStorage.getItem('ninjaHighScore');
                if (savedHighScore) setHighScore(parseInt(savedHighScore));
            }
        });
        return () => unsubscribe();
    }, []);

    // Leaderboard Listener
    useEffect(() => {
        const q = query(collection(db, 'leaderboard'), orderBy('score', 'desc'), limit(10));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const entries: LeaderboardEntry[] = [];
            snapshot.forEach((doc) => entries.push(doc.data() as LeaderboardEntry));
            setLeaderboard(entries);
        }, (error) => {
            handleFirestoreError(error, OperationType.LIST, 'leaderboard');
        });
        return () => unsubscribe();
    }, []);

    // Game Initialization
    useEffect(() => {
        const tutorialDone = localStorage.getItem('tutorialCompleted');
        if (tutorialDone === 'true') {
            setGameState('START');
        } else {
            setGameState('TUTORIAL_PROMPT');
        }

        if (canvasRef.current && !engineRef.current) {
            engineRef.current = new GameEngine(canvasRef.current);
        }

        if (engineRef.current) {
            engineRef.current.setCallbacks(
                setScore,
                async (finalScore, sessionCoins, dodgedObstacles) => {
                    setGameState('GAME_OVER');
                    setActivePowerUp(null);
                    
                    // Validate sessionCoins to prevent cheating
                    const maxPossibleCoins = Math.floor(finalScore / 2) + 10;
                    const validatedCoins = Math.min(sessionCoins, maxPossibleCoins);
                    
                    // Update local state
                    let newHigh = highScore;
                    if (finalScore > highScore) {
                        newHigh = finalScore;
                        setHighScore(finalScore);
                        localStorage.setItem('ninjaHighScore', finalScore.toString());
                    }

                    // Handle Daily Challenge
                    let challengeReward = 0;
                    if (dailyChallenge && !dailyChallenge.completed) {
                        let newProgress = dailyChallenge.progress;
                        if (dailyChallenge.type === 'coins') newProgress += validatedCoins;
                        else if (dailyChallenge.type === 'score') newProgress = Math.max(newProgress, finalScore);
                        else if (dailyChallenge.type === 'dodge') newProgress += dodgedObstacles;

                        if (newProgress >= dailyChallenge.target) {
                            newProgress = dailyChallenge.target;
                            challengeReward = dailyChallenge.reward;
                            const updatedChallenge = { ...dailyChallenge, progress: newProgress, completed: true };
                            setDailyChallenge(updatedChallenge);
                            localStorage.setItem('ninja_daily_' + new Date().toDateString(), JSON.stringify(updatedChallenge));
                        } else {
                            const updatedChallenge = { ...dailyChallenge, progress: newProgress };
                            setDailyChallenge(updatedChallenge);
                            localStorage.setItem('ninja_daily_' + new Date().toDateString(), JSON.stringify(updatedChallenge));
                        }
                    }

                    // Save to Firebase securely using increment
                    if (auth.currentUser && profile) {
                        try {
                            const userRef = doc(db, 'users', auth.currentUser.uid);
                            await updateDoc(userRef, {
                                highScore: newHigh,
                                coins: increment(validatedCoins + challengeReward)
                            });
                            
                            // Update local profile coins
                            setProfile(prev => prev ? { ...prev, coins: prev.coins + validatedCoins + challengeReward } : null);
                            setCoins(prev => prev + validatedCoins + challengeReward);
                            
                            if (finalScore > profile.highScore) {
                                const leadRef = doc(db, 'leaderboard', auth.currentUser.uid);
                                await setDoc(leadRef, {
                                    uid: auth.currentUser.uid,
                                    displayName: profile.displayName,
                                    photoURL: profile.photoURL,
                                    score: finalScore,
                                    timestamp: Date.now()
                                });
                            }
                        } catch (error) {
                            handleFirestoreError(error, OperationType.WRITE, 'users/leaderboard');
                        }
                    } else {
                        setCoins(prev => prev + validatedCoins + challengeReward);
                    }
                },
                () => {
                    localStorage.setItem('tutorialCompleted', 'true');
                    setGameState('START');
                },
                () => {
                    // Coins are incremented at game over to prevent client-side cheating
                },
                (type: string) => {
                    setActivePowerUp(type);
                },
                () => {
                    setActivePowerUp(null);
                }
            );
        }

        return () => {
            if (engineRef.current) {
                engineRef.current.stop();
            }
        };
    }, [highScore, profile, dailyChallenge]);

    const startGame = () => {
        setGameState('PLAYING');
        setScore(0);
        engineRef.current?.start(false, difficulty);
    };

    const startTutorial = () => {
        setGameState('TUTORIAL_PLAYING');
        setScore(0);
        engineRef.current?.start(true);
    };

    const skipTutorial = () => {
        localStorage.setItem('tutorialCompleted', 'true');
        setGameState('START');
    };

    const handleTap = (e: React.TouchEvent | React.MouseEvent) => {
        e.preventDefault();
        if (gameState === 'PLAYING' || gameState === 'TUTORIAL_PLAYING') {
            engineRef.current?.tap();
        }
    };

    const shareRecord = async () => {
        const text = `Ho schivato ${score} ostacoli in Ninja Runner! Riesci a battermi?`;
        if (navigator.share) {
            try {
                await navigator.share({ title: 'Ninja Runner Record', text: text });
            } catch (e) { console.log('Condivisione annullata'); }
        } else {
            navigator.clipboard.writeText(text);
            alert('Risultato copiato negli appunti!');
        }
    };

    const handleLogin = async () => {
        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error("Login failed", error);
        }
    };

    const buySkin = async (skinId: string, price: number) => {
        if (!user || !profile) return;
        if (profile.coins >= price && !profile.unlockedSkins.includes(skinId)) {
            try {
                const newUnlocked = [...profile.unlockedSkins, skinId];
                const userRef = doc(db, 'users', user.uid);
                await updateDoc(userRef, { coins: increment(-price), unlockedSkins: newUnlocked });
                setProfile({ ...profile, coins: profile.coins - price, unlockedSkins: newUnlocked });
                setCoins(prev => prev - price);
            } catch (error) {
                handleFirestoreError(error, OperationType.UPDATE, 'users');
            }
        }
    };

    const selectSkin = async (skinId: string) => {
        if (!user || !profile) return;
        if (profile.unlockedSkins.includes(skinId)) {
            try {
                const userRef = doc(db, 'users', user.uid);
                await updateDoc(userRef, { selectedSkin: skinId });
                setProfile({ ...profile, selectedSkin: skinId });
                const skin = SKINS.find(s => s.id === skinId);
                if (skin && engineRef.current) engineRef.current.setNinjaColor(skin.color);
            } catch (error) {
                handleFirestoreError(error, OperationType.UPDATE, 'users');
            }
        }
    };

    const buyAudio = async (type: 'music' | 'deathPhrase', id: string, price: number) => {
        if (!user || !profile) return;
        const unlockedList = type === 'music' ? profile.unlockedMusic : profile.unlockedDeathPhrases;
        if (profile.coins >= price && !unlockedList.includes(id)) {
            try {
                const newUnlocked = [...unlockedList, id];
                const updateData = type === 'music' ? { coins: increment(-price), unlockedMusic: newUnlocked } : { coins: increment(-price), unlockedDeathPhrases: newUnlocked };
                const userRef = doc(db, 'users', user.uid);
                await updateDoc(userRef, updateData);
                const profileUpdate = type === 'music' ? { coins: profile.coins - price, unlockedMusic: newUnlocked } : { coins: profile.coins - price, unlockedDeathPhrases: newUnlocked };
                setProfile({ ...profile, ...profileUpdate });
                setCoins(prev => prev - price);
            } catch (error) {
                handleFirestoreError(error, OperationType.UPDATE, 'users');
            }
        }
    };

    const selectAudio = async (type: 'music' | 'deathPhrase', id: string) => {
        if (!user || !profile) return;
        const unlockedList = type === 'music' ? profile.unlockedMusic : profile.unlockedDeathPhrases;
        if (unlockedList.includes(id)) {
            try {
                const updateData = type === 'music' ? { selectedMusic: id } : { selectedDeathPhrase: id };
                const userRef = doc(db, 'users', user.uid);
                await updateDoc(userRef, updateData);
                setProfile({ ...profile, ...updateData });
                
                if (engineRef.current) {
                    const m = type === 'music' ? id : profile.selectedMusic;
                    const dp = type === 'deathPhrase' ? id : profile.selectedDeathPhrase;
                    const dpText = DEATH_PHRASES.find(d => d.id === dp)?.text || 'you are dead';
                    engineRef.current.setAudioConfig(m, dpText);
                }
            } catch (error) {
                handleFirestoreError(error, OperationType.UPDATE, 'users');
            }
        }
    };

    const buyBundle = async (coinsToAdd: number) => {
        if (!user || !profile || isProcessing) return;
        setIsProcessing(true);
        // Simulate IAP processing
        setTimeout(async () => {
            try {
                const userRef = doc(db, 'users', user.uid);
                await updateDoc(userRef, { coins: increment(coinsToAdd) });
                setProfile({ ...profile, coins: profile.coins + coinsToAdd });
                setCoins(prev => prev + coinsToAdd);
            } catch (error) {
                handleFirestoreError(error, OperationType.UPDATE, 'users');
            } finally {
                setIsProcessing(false);
            }
        }, 1500);
    };

    return (
        <ErrorBoundary>
            <div className="relative w-full h-screen bg-slate-950 overflow-hidden touch-none select-none flex items-center justify-center font-sans">
                <canvas
                    ref={canvasRef}
                    width={800}
                    height={450}
                    className="max-w-full max-h-full object-contain shadow-2xl shadow-black/50"
                    onTouchStart={handleTap}
                    onMouseDown={handleTap}
                />

                {/* Top Bar (Auth & Coins) */}
                {(gameState === 'START' || gameState === 'GAME_OVER' || gameState === 'LEADERBOARD' || gameState === 'SHOP') && (
                    <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-auto z-20">
                        <div className="flex gap-2">
                            {user ? (
                                <button onClick={() => signOut(auth)} className="bg-slate-800/80 hover:bg-slate-700 backdrop-blur text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-bold transition-colors">
                                    <img src={user.photoURL || ''} alt="Profile" className="w-6 h-6 rounded-full" referrerPolicy="no-referrer" />
                                    <span className="hidden sm:inline">{user.displayName}</span>
                                    <LogOut className="w-4 h-4 text-slate-400" />
                                </button>
                            ) : (
                                <button onClick={handleLogin} className="bg-blue-600/90 hover:bg-blue-500 backdrop-blur text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-bold transition-colors shadow-lg shadow-blue-900/20">
                                    <LogIn className="w-4 h-4" /> {t.loginToSave}
                                </button>
                            )}
                            <select 
                                value={lang} 
                                onChange={(e) => setLang(e.target.value as Language)}
                                className="bg-slate-800/80 text-white px-2 py-2 rounded-xl text-sm font-bold outline-none border border-slate-700"
                            >
                                {Object.keys(TRANSLATIONS).map(l => <option key={l} value={l}>{l.toUpperCase()}</option>)}
                            </select>
                        </div>
                        <div className="bg-amber-500/10 border border-amber-500/20 backdrop-blur text-amber-400 px-4 py-2 rounded-xl flex items-center gap-2 font-black text-lg shadow-lg">
                            <Coins className="w-5 h-5" /> {coins}
                        </div>
                    </div>
                )}

                {/* UI Overlays */}
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center z-10">
                    {gameState === 'TUTORIAL_PROMPT' && (
                        <div className="bg-slate-800/95 p-8 rounded-3xl border border-slate-700 text-center max-w-sm pointer-events-auto shadow-2xl mx-4">
                            <h2 className="text-3xl font-black text-white mb-4">Tutorial</h2>
                            <p className="text-slate-300 mb-8 text-lg leading-relaxed">
                                {t.tutorialPrompt}
                            </p>
                            <div className="flex flex-col gap-4">
                                <button onClick={startTutorial} className="bg-emerald-600 hover:bg-emerald-500 text-white py-4 rounded-2xl font-bold text-xl transition-transform active:scale-95 shadow-lg shadow-emerald-900/50">
                                    {t.startTutorial}
                                </button>
                                <button onClick={skipTutorial} className="bg-slate-700 hover:bg-slate-600 text-white py-4 rounded-2xl font-bold text-lg transition-transform active:scale-95">
                                    {t.skip}
                                </button>
                            </div>
                        </div>
                    )}

                    {gameState === 'START' && (
                        <div className="pointer-events-auto text-center flex flex-col items-center">
                            <h1 className="text-6xl md:text-7xl font-black text-white mb-8 tracking-tighter drop-shadow-2xl italic">
                                NINJA<br/><span className="text-emerald-500">REVERS</span>
                            </h1>
                            
                            {/* Daily Challenge UI */}
                            {dailyChallenge && (
                                <div className="bg-slate-800/80 border border-amber-500/30 p-4 rounded-2xl mb-8 max-w-sm w-full backdrop-blur shadow-lg">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-amber-400 font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                                            <Trophy className="w-4 h-4" /> {t.dailyChallenge}
                                        </h3>
                                        <span className="text-emerald-400 font-black text-sm flex items-center gap-1">
                                            +{dailyChallenge.reward} <Coins className="w-3 h-3" />
                                        </span>
                                    </div>
                                    <p className="text-white text-sm mb-3">{dailyChallenge.desc}</p>
                                    <div className="w-full bg-slate-900 rounded-full h-2.5 mb-1 overflow-hidden">
                                        <div 
                                            className={`h-2.5 rounded-full ${dailyChallenge.completed ? 'bg-emerald-500' : 'bg-amber-500'}`} 
                                            style={{ width: `${Math.min(100, (dailyChallenge.progress / dailyChallenge.target) * 100)}%` }}
                                        ></div>
                                    </div>
                                    <div className="flex justify-between text-xs text-slate-400 font-bold">
                                        <span>{dailyChallenge.progress} / {dailyChallenge.target}</span>
                                        {dailyChallenge.completed && <span className="text-emerald-400">{t.completed}</span>}
                                    </div>
                                </div>
                            )}

                            {/* Difficulty Selection */}
                            <div className="flex gap-2 mb-8 bg-slate-800/50 p-1 rounded-2xl backdrop-blur">
                                {['EASY', 'NORMAL', 'HARD'].map((level) => (
                                    <button
                                        key={level}
                                        onClick={() => setDifficulty(level as any)}
                                        className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${difficulty === level ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}`}
                                    >
                                        {t[level.toLowerCase() as keyof typeof t]}
                                    </button>
                                ))}
                            </div>

                            <button onClick={startGame} className="bg-emerald-600 hover:bg-emerald-500 text-white px-16 py-5 rounded-full font-black text-3xl shadow-2xl shadow-emerald-900/50 transition-transform active:scale-95 mb-6">
                                {t.play}
                            </button>
                            <div className="flex gap-4">
                                <button onClick={() => setGameState('LEADERBOARD')} className="bg-slate-800 hover:bg-slate-700 text-white p-4 rounded-2xl transition-transform active:scale-95 shadow-lg flex flex-col items-center gap-2">
                                    <Trophy className="w-6 h-6 text-amber-400" />
                                    <span className="text-xs font-bold uppercase">{t.leaderboard}</span>
                                </button>
                                <button onClick={() => setGameState('SHOP')} className="bg-slate-800 hover:bg-slate-700 text-white p-4 rounded-2xl transition-transform active:scale-95 shadow-lg flex flex-col items-center gap-2">
                                    <ShoppingBag className="w-6 h-6 text-emerald-400" />
                                    <span className="text-xs font-bold uppercase">{t.shop}</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {gameState === 'LEADERBOARD' && (
                        <div className="bg-slate-900/95 p-6 md:p-8 rounded-3xl border border-slate-700 w-full max-w-md pointer-events-auto shadow-2xl mx-4 max-h-[80vh] flex flex-col">
                            <h2 className="text-3xl font-black text-white mb-6 flex items-center justify-center gap-3">
                                <Trophy className="w-8 h-8 text-amber-400" /> {t.leaderboard}
                            </h2>
                            <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                                {leaderboard.length === 0 ? (
                                    <p className="text-slate-400 text-center py-8">No scores yet.</p>
                                ) : (
                                    leaderboard.map((entry, index) => (
                                        <div key={entry.uid} className={`flex items-center gap-4 p-3 rounded-xl ${index === 0 ? 'bg-amber-500/10 border border-amber-500/30' : index === 1 ? 'bg-slate-300/10 border border-slate-300/30' : index === 2 ? 'bg-amber-700/10 border border-amber-700/30' : 'bg-slate-800/50'}`}>
                                            <div className={`w-8 text-center font-black ${index === 0 ? 'text-amber-400' : index === 1 ? 'text-slate-300' : index === 2 ? 'text-amber-600' : 'text-slate-500'}`}>
                                                #{index + 1}
                                            </div>
                                            {entry.photoURL ? (
                                                <img src={entry.photoURL} alt="" className="w-10 h-10 rounded-full" referrerPolicy="no-referrer" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center"><UserIcon className="w-5 h-5 text-slate-400" /></div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-white font-bold truncate">{entry.displayName}</p>
                                            </div>
                                            <div className="text-emerald-400 font-black text-xl">{entry.score}</div>
                                        </div>
                                    ))
                                )}
                            </div>
                            <button onClick={() => setGameState('START')} className="mt-6 bg-slate-700 hover:bg-slate-600 text-white py-4 rounded-2xl font-bold text-lg transition-transform active:scale-95 w-full">
                                {t.menu}
                            </button>
                        </div>
                    )}

                    {gameState === 'SHOP' && (
                        <div className="bg-slate-900/95 p-6 md:p-8 rounded-3xl border border-slate-700 w-full max-w-md pointer-events-auto shadow-2xl mx-4 max-h-[80vh] flex flex-col">
                            <h2 className="text-3xl font-black text-white mb-2 flex items-center justify-center gap-3">
                                <ShoppingBag className="w-8 h-8 text-emerald-400" /> {t.shopTitle}
                            </h2>
                            <p className="text-slate-400 text-center mb-6 text-sm">{t.customize}</p>
                            
                            {!user ? (
                                <div className="text-center py-8 bg-slate-800/50 rounded-2xl border border-slate-700">
                                    <p className="text-slate-300 mb-4">{t.loginToSave}</p>
                                    <button onClick={handleLogin} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold inline-flex items-center gap-2">
                                        <LogIn className="w-5 h-5" /> {t.login}
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="flex gap-2 mb-4">
                                        <button onClick={() => setShopTab('skins')} className={`flex-1 py-2 rounded-lg font-bold text-sm transition-colors ${shopTab === 'skins' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>{t.skins}</button>
                                        <button onClick={() => setShopTab('audio')} className={`flex-1 py-2 rounded-lg font-bold text-sm transition-colors ${shopTab === 'audio' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>{t.audio}</button>
                                        <button onClick={() => setShopTab('coins')} className={`flex-1 py-2 rounded-lg font-bold text-sm transition-colors ${shopTab === 'coins' ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>{t.coins}</button>
                                    </div>
                                    <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                                        {shopTab === 'skins' && SKINS.map(skin => {
                                            const isUnlocked = profile?.unlockedSkins.includes(skin.id);
                                            const isSelected = profile?.selectedSkin === skin.id;
                                            const canAfford = (profile?.coins || 0) >= skin.price;
                                            
                                            return (
                                                <div key={skin.id} className={`flex items-center justify-between p-4 rounded-xl border ${isSelected ? 'bg-emerald-900/20 border-emerald-500/50' : 'bg-slate-800/50 border-slate-700'}`}>
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-lg flex items-center justify-center shadow-inner" style={{ backgroundColor: '#09090b' }}>
                                                            <div className="w-6 h-2 rounded-full" style={{ backgroundColor: skin.color }}></div>
                                                        </div>
                                                        <div>
                                                            <p className="text-white font-bold">{skin.name}</p>
                                                            {!isUnlocked && (
                                                                <p className={`text-sm font-bold flex items-center gap-1 ${canAfford ? 'text-amber-400' : 'text-slate-500'}`}>
                                                                    <Coins className="w-3 h-3" /> {skin.price}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    
                                                    {isSelected ? (
                                                        <span className="text-emerald-400 font-bold text-sm bg-emerald-400/10 px-3 py-1 rounded-full">{t.selected}</span>
                                                    ) : isUnlocked ? (
                                                        <button onClick={() => selectSkin(skin.id)} className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors">
                                                            {t.use}
                                                        </button>
                                                    ) : (
                                                        <button 
                                                            onClick={() => buySkin(skin.id, skin.price)} 
                                                            disabled={!canAfford}
                                                            className={`${canAfford ? 'bg-amber-600 hover:bg-amber-500 text-white' : 'bg-slate-800 text-slate-500 cursor-not-allowed'} px-4 py-2 rounded-lg font-bold text-sm transition-colors`}
                                                        >
                                                            {t.buy}
                                                        </button>
                                                    )}
                                                </div>
                                            );
                                        })}

                                        {shopTab === 'audio' && (
                                            <>
                                                <h3 className="text-slate-400 font-bold text-sm uppercase mt-2 mb-2">{t.music}</h3>
                                                {MUSIC_TRACKS.map(track => {
                                                    const isUnlocked = profile?.unlockedMusic.includes(track.id);
                                                    const isSelected = profile?.selectedMusic === track.id;
                                                    const canAfford = (profile?.coins || 0) >= track.price;
                                                    return (
                                                        <div key={track.id} className={`flex items-center justify-between p-4 rounded-xl border ${isSelected ? 'bg-emerald-900/20 border-emerald-500/50' : 'bg-slate-800/50 border-slate-700'}`}>
                                                            <div className="flex items-center gap-3">
                                                                <Music className="w-5 h-5 text-slate-400" />
                                                                <div>
                                                                    <p className="text-white font-bold">{track.name}</p>
                                                                    {!isUnlocked && (
                                                                        <p className={`text-sm font-bold flex items-center gap-1 ${canAfford ? 'text-amber-400' : 'text-slate-500'}`}>
                                                                            <Coins className="w-3 h-3" /> {track.price}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            {isSelected ? (
                                                                <span className="text-emerald-400 font-bold text-sm bg-emerald-400/10 px-3 py-1 rounded-full">{t.selected}</span>
                                                            ) : isUnlocked ? (
                                                                <button onClick={() => selectAudio('music', track.id)} className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors">{t.use}</button>
                                                            ) : (
                                                                <button onClick={() => buyAudio('music', track.id, track.price)} disabled={!canAfford} className={`${canAfford ? 'bg-amber-600 hover:bg-amber-500 text-white' : 'bg-slate-800 text-slate-500 cursor-not-allowed'} px-4 py-2 rounded-lg font-bold text-sm transition-colors`}>{t.buy}</button>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                                <h3 className="text-slate-400 font-bold text-sm uppercase mt-4 mb-2">{t.deathPhrases}</h3>
                                                {DEATH_PHRASES.map(phrase => {
                                                    const isUnlocked = profile?.unlockedDeathPhrases.includes(phrase.id);
                                                    const isSelected = profile?.selectedDeathPhrase === phrase.id;
                                                    const canAfford = (profile?.coins || 0) >= phrase.price;
                                                    return (
                                                        <div key={phrase.id} className={`flex items-center justify-between p-4 rounded-xl border ${isSelected ? 'bg-emerald-900/20 border-emerald-500/50' : 'bg-slate-800/50 border-slate-700'}`}>
                                                            <div className="flex items-center gap-3">
                                                                <Mic className="w-5 h-5 text-slate-400" />
                                                                <div>
                                                                    <p className="text-white font-bold">{phrase.name}</p>
                                                                    {!isUnlocked && (
                                                                        <p className={`text-sm font-bold flex items-center gap-1 ${canAfford ? 'text-amber-400' : 'text-slate-500'}`}>
                                                                            <Coins className="w-3 h-3" /> {phrase.price}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            {isSelected ? (
                                                                <span className="text-emerald-400 font-bold text-sm bg-emerald-400/10 px-3 py-1 rounded-full">{t.selected}</span>
                                                            ) : isUnlocked ? (
                                                                <button onClick={() => selectAudio('deathPhrase', phrase.id)} className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors">{t.use}</button>
                                                            ) : (
                                                                <button onClick={() => buyAudio('deathPhrase', phrase.id, phrase.price)} disabled={!canAfford} className={`${canAfford ? 'bg-amber-600 hover:bg-amber-500 text-white' : 'bg-slate-800 text-slate-500 cursor-not-allowed'} px-4 py-2 rounded-lg font-bold text-sm transition-colors`}>{t.buy}</button>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </>
                                        )}

                                        {shopTab === 'coins' && (
                                            <>
                                                <h3 className="text-slate-400 font-bold text-sm uppercase mt-2 mb-2">{t.bundles}</h3>
                                                {COIN_BUNDLES.map(bundle => (
                                                    <div key={bundle.id} className="flex items-center justify-between p-4 rounded-xl border bg-slate-800/50 border-slate-700">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                                                                <Coins className="w-6 h-6 text-amber-400" />
                                                            </div>
                                                            <div>
                                                                <p className="text-white font-bold">{bundle.name}</p>
                                                                <p className="text-amber-400 font-bold text-sm">+{bundle.coins} {t.coins}</p>
                                                            </div>
                                                        </div>
                                                        <button 
                                                            onClick={() => buyBundle(bundle.coins)} 
                                                            disabled={isProcessing}
                                                            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors flex items-center gap-2"
                                                        >
                                                            <CreditCard className="w-4 h-4" /> {isProcessing ? t.processing : bundle.price}
                                                        </button>
                                                    </div>
                                                ))}
                                            </>
                                        )}
                                    </div>
                                </>
                            )}
                            <button onClick={() => setGameState('START')} className="mt-6 bg-slate-700 hover:bg-slate-600 text-white py-4 rounded-2xl font-bold text-lg transition-transform active:scale-95 w-full">
                                {t.menu}
                            </button>
                        </div>
                    )}

                    {gameState === 'GAME_OVER' && (
                        <div className="fixed inset-0 bg-red-950/90 z-50 flex flex-col items-center justify-center p-4 pointer-events-auto">
                            <h1 className="text-6xl md:text-8xl font-black text-red-500 mb-8 tracking-tighter drop-shadow-[0_0_30px_rgba(239,68,68,0.8)] text-center uppercase">
                                You Are Dead
                            </h1>
                            <div className="bg-slate-900/90 p-8 rounded-3xl border border-red-900/50 text-center max-w-sm w-full shadow-2xl">
                                <h2 className="text-3xl font-black text-white mb-6">{t.gameOver}</h2>
                                <div className="bg-slate-950/80 rounded-2xl p-6 mb-6 border border-slate-800">
                                    <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-1">{t.score}</p>
                                    <p className="text-6xl font-black text-emerald-400">{score}</p>
                                </div>
                                <div className="mb-8">
                                    <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-1">{t.bestScore}</p>
                                    <p className="text-3xl font-bold text-white">{highScore}</p>
                                </div>
                                <div className="flex flex-col gap-4">
                                    <button onClick={startGame} className="bg-emerald-600 hover:bg-emerald-500 text-white py-4 rounded-2xl font-bold text-xl transition-transform active:scale-95 shadow-lg shadow-emerald-900/50">
                                        {t.retry}
                                    </button>
                                    <div className="flex gap-4">
                                        <button onClick={() => setGameState('START')} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-2xl font-bold transition-transform active:scale-95">
                                            {t.menu}
                                        </button>
                                        <button onClick={shareRecord} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-2xl font-bold transition-transform active:scale-95 flex items-center justify-center gap-2">
                                            <Share2 className="w-5 h-5" /> {t.share}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* HUD */}
                {(gameState === 'PLAYING' || gameState === 'TUTORIAL_PLAYING') && (
                    <div className="absolute top-6 right-6 md:top-8 md:right-8 pointer-events-none z-10 flex flex-col items-end gap-4">
                        <div className="flex gap-4">
                            <div className="bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-full border border-slate-700/50 shadow-xl flex items-center gap-2">
                                <Coins className="w-5 h-5 text-amber-400" />
                                <span className="text-white font-black text-xl">{coins}</span>
                            </div>
                            <div className="bg-slate-900/80 backdrop-blur-md px-6 py-2 rounded-full border border-slate-700/50 shadow-xl flex items-center">
                                <span className="text-slate-400 font-bold mr-3 tracking-widest text-sm">{t.score}</span>
                                <span className="text-white font-black text-3xl">{score}</span>
                            </div>
                        </div>
                        {activePowerUp && (
                            <div className={`bg-slate-900/90 backdrop-blur-md px-6 py-3 rounded-full border shadow-xl flex items-center gap-3 animate-pulse
                                ${activePowerUp === 'INVINCIBILITY' ? 'border-amber-400/50 shadow-amber-400/20' : 
                                  activePowerUp === 'MULTIPLIER' ? 'border-purple-400/50 shadow-purple-400/20' : 
                                  'border-cyan-400/50 shadow-cyan-400/20'}`}
                            >
                                <span className={`font-black uppercase tracking-wider
                                    ${activePowerUp === 'INVINCIBILITY' ? 'text-amber-400' : 
                                      activePowerUp === 'MULTIPLIER' ? 'text-purple-400' : 
                                      'text-cyan-400'}`}
                                >
                                    {activePowerUp === 'INVINCIBILITY' ? t.powerupInvincible :
                                     activePowerUp === 'MULTIPLIER' ? t.powerupMultiplier :
                                     t.powerupSlowMo}
                                </span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </ErrorBoundary>
    );
}

