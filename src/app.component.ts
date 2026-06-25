import {
  Component,
  computed,
  inject,
  signal,
  ViewChild,
  effect,
  OnInit,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import {
  RecruitmentDataService,
  Task,
  DocumentItem,
  RejectionReason,
} from "./services/recruitment-data.service";
import {
  EmailScenariosService,
  EmailScenario,
} from "./services/email-scenarios.service";
import { JobSearchModalComponent } from "./app/components/job-search-modal.component";
import { SharedStateService, DEFAULT_SIG_FR, DEFAULT_SIG_EN } from "./services/shared-state.service";
import { FormsModule } from "@angular/forms";

type AppStage = "intro" | "minor-check" | "main";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [CommonModule, JobSearchModalComponent, FormsModule],
  template: `
    @if (!isAuthenticated()) {
      <div class="h-screen w-full bg-slate-100 flex flex-col items-center justify-center p-4">
        <div class="bg-white p-8 rounded-3xl shadow-2xl max-w-sm w-full text-center border border-slate-200">
          <div class="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 class="text-2xl font-bold text-slate-800 mb-2">Accès restreint</h2>
          <p class="text-sm text-slate-500 mb-6">Veuillez entrer le mot de passe pour accéder à l'application.</p>
          <form (submit)="checkPassword($event)">
            <div class="relative mb-4">
              <input [type]="showPassword() ? 'text' : 'password'" [(ngModel)]="passwordInput" [ngModelOptions]="{standalone: true}" class="w-full p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-center text-lg tracking-widest transition-all pr-12" placeholder="Mot de passe" />
              <button type="button" (click)="showPassword.set(!showPassword())" class="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-slate-600 focus:outline-none">
                @if (showPassword()) {
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                } @else {
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                }
              </button>
            </div>
            @if (authError()) {
              <p class="text-red-500 text-sm mb-4 font-medium animate-pulse">Mot de passe incorrect.</p>
            }
            <button type="submit" class="w-full py-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all font-bold shadow-md active:scale-95 flex justify-center items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
              Déverrouiller
            </button>
          </form>
        </div>
      </div>
    } @else {
    @if (showSignaturePage()) {
      <div class="h-screen w-full bg-slate-100 flex flex-col p-6 overflow-hidden select-none">
        <!-- Header -->
        <div class="max-w-5xl w-full mx-auto flex items-center justify-between mb-6 bg-white p-4 rounded-2xl shadow-sm border border-slate-200 shrink-0">
          <div class="flex items-center gap-4">
            <button (click)="closeSignaturePage()" class="p-2.5 hover:bg-slate-100 rounded-full transition-colors text-slate-600 border border-transparent hover:border-slate-200" title="Retour">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div>
              <h1 class="text-xl font-bold text-slate-800 flex items-center gap-2">
                Gestion de la signature
              </h1>
              <p class="text-xs text-slate-500 mt-0.5">Personnalisez vos signatures de courriel pour les forces armées canadiennes.</p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <button (click)="resetSignatures()" class="px-4 py-2 border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 rounded-xl transition-all text-sm font-semibold flex items-center gap-2 active:scale-95">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 15H17M4 9a8.001 8.001 0 0113.313-2.24L20 9" />
              </svg>
              Réinitialiser par défaut
            </button>
            <button (click)="saveSignatures()" class="px-5 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all text-sm font-semibold flex items-center gap-2 shadow-md active:scale-95">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              Sauvegarder
            </button>
          </div>
        </div>

        <!-- Main Content -->
        <div class="max-w-5xl w-full mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 min-h-0 pb-4">
          <!-- French signature card -->
          <div class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col min-h-0">
            <div class="flex items-center justify-between mb-3 shrink-0">
              <h2 class="text-md font-bold text-slate-800 flex items-center gap-2">
                <span class="bg-indigo-100 text-indigo-800 px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider font-sans">FR</span>
                Signature française
              </h2>
              <span class="text-xs text-slate-400">Section francophone</span>
            </div>
            <p class="text-xs text-slate-500 mb-4 shrink-0">Cette signature sera intégrée au bas de vos correspondances rédigées en français.</p>
            <textarea [(ngModel)]="sigFrTemp" class="w-full flex-1 p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm font-mono overflow-y-auto resize-none leading-relaxed bg-slate-50/30" placeholder="Ajoutez votre signature française..."></textarea>
          </div>

          <!-- English signature card -->
          <div class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col min-h-0">
            <div class="flex items-center justify-between mb-3 shrink-0">
              <h2 class="text-md font-bold text-slate-800 flex items-center gap-2">
                <span class="bg-indigo-100 text-indigo-800 px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider font-sans">EN</span>
                Signature anglaise
              </h2>
              <span class="text-xs text-slate-400">Section anglophone</span>
            </div>
            <p class="text-xs text-slate-500 mb-4 shrink-0">Cette signature sera intégrée au bas de vos correspondances rédigées en anglais.</p>
            <textarea [(ngModel)]="sigEnTemp" class="w-full flex-1 p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm font-mono overflow-y-auto resize-none leading-relaxed bg-slate-50/30" placeholder="Ajoutez votre signature anglaise..."></textarea>
          </div>
        </div>

        <!-- Toast message for Save feedback -->
        @if (showToast()) {
          <div class="fixed bottom-6 right-6 bg-slate-900 border border-slate-800 text-white px-5 py-3.5 rounded-xl shadow-xl flex items-center gap-2.5 transition-all z-50">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            <span class="text-sm font-semibold">Signature sauvegardée avec succès !</span>
          </div>
        }
      </div>
    } @else {
      <!-- INTRO SCREEN -->
      @if (stage() === "intro") {
      <div
        class="h-screen w-full bg-slate-200 flex flex-col items-center justify-center p-4 relative"
      >
        <!-- Job Search Button (Intro) -->
        <button
          (click)="toggleJobSearch()"
          class="absolute top-4 right-16 bg-white p-2 rounded-full shadow-md hover:bg-slate-50 transition-all z-50 text-slate-600"
          title="Recherche de métiers"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </button>

        <!-- Signature Management Button (Intro) -->
        <button
          (click)="toggleSignatureSettings()"
          class="absolute top-4 right-4 bg-white p-2 rounded-full shadow-md hover:bg-slate-50 transition-all z-50 text-slate-600"
          title="Gestion de la signature"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </button>

        <!-- App Name with Hover Effect (Outside panel, larger) -->
        <div class="flex justify-center w-full mb-16 z-10">
          <div
            class="group relative flex items-center justify-center overflow-hidden rounded-full bg-indigo-50 border-2 border-indigo-200/50 transition-all duration-500 hover:bg-white hover:border-indigo-300 hover:shadow-2xl shadow-xl h-16 w-56 hover:w-full max-w-md hover:h-20 cursor-default"
          >
            <div class="absolute flex w-full items-center justify-center px-4">
              <span
                class="font-black text-4xl tracking-widest text-indigo-700 transition-all duration-500 group-hover:-translate-y-16 group-hover:opacity-0 absolute drop-shadow-sm"
                >MARCEL</span
              >
              <span
                class="text-[11px] sm:text-xs leading-snug uppercase tracking-widest font-semibold text-slate-500 text-center transition-all duration-500 translate-y-16 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 absolute w-full px-2"
              >
                <span class="font-black text-indigo-700 text-sm">M</span>odule
                d'<span class="font-black text-indigo-700 text-sm">A</span
                >nalyse et de
                <span class="font-black text-indigo-700 text-sm">R</span
                >éorientation <br class="hidden sm:block" />
                des
                <span class="font-black text-indigo-700 text-sm">C</span
                >andidats à l'<span class="font-black text-indigo-700 text-sm"
                  >E</span
                >nrôlement pour les
                <span class="font-black text-indigo-700 text-sm">L</span>âches
              </span>
            </div>
          </div>
        </div>

        <div
          class="bg-white rounded-3xl shadow-2xl p-8 max-w-lg w-full text-center border border-white/50 relative z-0"
        >
          <div class="mb-8">
            <div
              class="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-8 w-8 text-slate-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
            <h1 class="text-3xl font-bold text-slate-800 mb-2">
              Vérification Initiale
            </h1>
            <p class="text-lg text-slate-600">Le postulant est-il mineur ?</p>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <button
              (click)="startMinorCheck()"
              class="py-4 px-6 bg-slate-800 text-white rounded-xl font-bold text-lg hover:bg-slate-700 transition-colors shadow-lg active:scale-95"
            >
              Oui
            </button>
            <button
              (click)="startMainProgram()"
              class="py-4 px-6 bg-white text-slate-800 border-2 border-slate-200 rounded-xl font-bold text-lg hover:bg-slate-50 transition-colors shadow-sm active:scale-95"
            >
              Non
            </button>
          </div>
        </div>
      </div>
    } @else {
      <!-- Main Container: Vertical layout now -->
      <div
        class="min-h-screen w-full bg-slate-200 text-slate-800 p-4 flex flex-col gap-4 font-sans relative"
      >
        <!-- TOP HEADER ROW -->
        <div class="flex items-center w-full shrink-0 gap-4">
          <!-- LEFT: Action Buttons & Banner -->
          <div class="flex items-center gap-4 flex-1">
            <!-- Restart App Button -->
            <button
              (click)="restartApp()"
              class="bg-white p-2 rounded-full shadow-md hover:bg-slate-50 transition-all text-slate-600 shrink-0 border border-slate-200"
              title="Relancer l'application"
            >
              <svg
                class="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
              </svg>
            </button>

            <!-- Minor Check Banner (if active) -->
            @if (stage() === "minor-check") {
              <div
                class="bg-indigo-900 text-white p-3 rounded-xl shadow-md flex justify-between items-center flex-1"
              >
                <div class="flex items-center gap-3">
                  <span
                    class="bg-indigo-700 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider"
                    >Mode Mineur</span
                  >
                  <span class="text-sm font-medium opacity-90"
                    >Veuillez valider les 4 documents requis (Certificat
                    naissance, Demande Partie H, ID Parent, Selfie
                    Parent).</span
                  >
                </div>

                <button
                  (click)="startMainProgram()"
                  class="px-4 py-2 bg-white text-indigo-900 rounded-lg text-sm font-bold shadow-sm transition-all hover:bg-indigo-50 active:scale-95 flex items-center gap-2 whitespace-nowrap ml-4 shrink-0 cursor-pointer"
                >
                  <span>Procéder à l'évaluation principale</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </button>
              </div>
            }
          </div>

          <!-- RIGHT: Action Buttons (Main) -->
          <div class="flex items-center gap-2 shrink-0">
            <!-- Tout Conforme Button -->
            <button
              (click)="setAllCompliant()"
              class="bg-emerald-50 p-2 px-3 rounded-full shadow-md transition-all flex items-center gap-2 font-bold text-sm text-emerald-700 border border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300"
              title="Mettre toutes les tâches instantanément conformes"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clip-rule="evenodd"
                />
              </svg>
              <span class="hidden sm:inline">Tout Conforme</span>
            </button>

            <!-- Rappel Général Button -->
            <button
              (click)="toggleGeneralReminder()"
              class="bg-white p-2 px-3 rounded-full shadow-md transition-all flex items-center gap-2 font-medium text-sm"
              [class.bg-indigo-50]="forceGeneralReminder()"
              [class.text-indigo-700]="forceGeneralReminder()"
              [class.border-indigo-200]="forceGeneralReminder()"
              [class.border]="forceGeneralReminder()"
              [class.text-slate-600]="!forceGeneralReminder()"
              [class.hover:bg-slate-50]="!forceGeneralReminder()"
              title="Courriel de rappel général"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <span class="hidden sm:inline">Rappel Général</span>
            </button>

            <!-- Job Search Button -->
            <button
              (click)="toggleJobSearch()"
              class="bg-white p-2 rounded-full shadow-md hover:bg-slate-50 transition-all text-slate-600"
              title="Recherche de métiers"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>

            <!-- Signature Management Button -->
            <button
              (click)="toggleSignatureSettings()"
              class="bg-white p-2 rounded-full shadow-md hover:bg-slate-50 transition-all text-slate-600"
              title="Gestion de la signature"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </button>
          </div>
        </div>

        <!-- SPLIT COLUMN LAYOUT: Tasks sidebar (left) and Documents Workspace (right) -->
        <div class="flex-1 flex gap-4 min-h-[600px] min-h-0">
          <!-- Panel 1: Navigation (Tasks) -->
          <nav
            class="w-[340px] shrink-0 bg-white rounded-2xl shadow-xl flex flex-col overflow-hidden border border-white/50"
          >
            <div class="p-4 bg-slate-50 border-b border-slate-200 flex-none">
              <h2
                class="font-bold text-slate-700 uppercase text-sm tracking-wider flex items-center gap-2"
              >
                <span
                  class="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs"
                  >1</span
                >
                Tâches du Portail
              </h2>
            </div>
            <div class="flex-1 overflow-y-auto p-3 space-y-2">
              @for (task of visibleTasks(); track task.nameFr) {
                <button
                  (click)="selectTask(task)"
                  class="w-full text-left p-3 rounded-xl transition-all duration-200 border border-transparent group relative overflow-hidden flex justify-between items-center"
                  [class.bg-slate-800]="selectedTask() === task"
                  [class.text-white]="selectedTask() === task"
                  [class.shadow-md]="selectedTask() === task"
                  [class.hover:bg-slate-100]="selectedTask() !== task"
                >
                  <!-- Dynamic Task Name logic inside the button -->
                  <div class="font-semibold text-sm pr-2 leading-snug">
                    {{ task.nameFr }}
                  </div>

                  <div class="flex items-center gap-2">
                    @if (isTaskCompliant(task)) {
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-5 w-5 text-green-500 shrink-0"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fill-rule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clip-rule="evenodd"
                        />
                      </svg>
                    }
                    <!-- Indicator for active -->
                    @if (selectedTask() === task) {
                      <div class="w-2 h-2 rounded-full bg-white shrink-0"></div>
                    }
                  </div>
                </button>
              }
            </div>
          </nav>

          <!-- Panel 2: Documents & Verification Workspace -->
          <section
            class="flex-1 bg-slate-50 rounded-2xl shadow-xl flex flex-col overflow-hidden border border-white/50"
          >
            <div
              class="p-4 bg-white border-b border-slate-200 flex-none z-10 shadow-sm"
            >
              <h2
                class="font-bold text-slate-700 uppercase text-sm tracking-wider flex items-center gap-2"
              >
                <span
                  class="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs"
                  >2</span
                >
                Documents & Vérification
              </h2>
            </div>

            <div class="flex-1 overflow-y-auto p-4 scroll-smooth">
              @if (selectedTask(); as task) {
                <div class="mb-6 flex justify-between items-start">
                  <div>
                    <h3
                      class="text-xl font-bold text-slate-800 mb-1 leading-tight flex items-center gap-2"
                    >
                      {{ task.nameFr }}
                      @if (isTaskCompliant(task)) {
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          class="h-6 w-6 text-green-500"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fill-rule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clip-rule="evenodd"
                          />
                        </svg>
                      }
                    </h3>
                    <p class="text-xs text-slate-500 font-medium">
                      {{ task.nameEn }}
                    </p>
                  </div>
                  <div class="flex items-center gap-3">
                    @if (task.nameFr.startsWith("Questionnaire médical")) {
                      <label
                        class="flex items-center gap-2 p-2 px-3 rounded-lg border border-amber-200 bg-amber-50/70 hover:bg-amber-50 cursor-pointer text-xs font-bold text-amber-900 transition-all active:scale-95"
                      >
                        <span class="relative flex items-center">
                          <input
                            type="checkbox"
                            class="peer h-4 w-4 appearance-none rounded border-2 border-amber-300 bg-white checked:bg-amber-600 checked:border-amber-600 focus:outline-none transition-all"
                            [checked]="triageMedicalRequis()"
                            (change)="toggleTriageMedical()"
                          />
                          <svg
                            class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="3"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          >
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        </span>
                        <span>Triage médical requis</span>
                      </label>
                    }

                    <button
                      (click)="toggleTaskNotCompleted(task)"
                      class="shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border shadow-sm active:scale-95 whitespace-nowrap"
                      [class.bg-red-100]="isTaskNotCompleted(task)"
                      [class.border-red-300]="isTaskNotCompleted(task)"
                      [class.text-red-800]="isTaskNotCompleted(task)"
                      [class.bg-white]="!isTaskNotCompleted(task)"
                      [class.text-slate-500]="!isTaskNotCompleted(task)"
                      [class.hover:bg-slate-100]="!isTaskNotCompleted(task)"
                      [class.border-slate-300]="!isTaskNotCompleted(task)"
                    >
                      Tâche non complétée
                    </button>
                  </div>
                </div>

                <div class="space-y-4">
                  @if (isTaskNotCompleted(task)) {
                    <div
                      class="p-8 text-center bg-amber-50/50 border border-amber-200 rounded-xl text-amber-900"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-10 w-10 mx-auto mb-2 text-amber-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                      <p class="font-bold text-sm">
                        Tâche non complétée dans le portail
                      </p>
                      <p
                        class="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed"
                      >
                        Cette tâche est actuellement marquée comme non
                        complétée. Tous les documents de cette tâche sont
                        masqués pour le recruteur.
                      </p>
                    </div>
                  }

                  @for (
                    doc of task.documents;
                    track doc.nameFr;
                    let isLastDoc = $last
                  ) {
                    <!-- Check dynamic visibility logic -->
                    @if (shouldShowDoc(task, doc)) {
                      <div
                        class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-300"
                      >
                        <!-- Header: Name + Button side-by-side -->
                        <div
                          class="p-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center gap-3"
                        >
                          <div class="flex-1 min-w-0">
                            <!-- Conditional Document Name Display -->
                            <div
                              class="font-bold text-slate-700 text-sm leading-snug"
                            >
                              @if (
                                stage() === "minor-check" &&
                                doc.nameFr === "Certificat de naissance"
                              ) {
                                Certificat de naissance version long avec le nom
                                des parents
                              } @else {
                                {{ doc.nameFr }}
                              }
                            </div>
                            <div
                              class="text-[10px] text-slate-500 leading-tight truncate"
                            >
                              {{ doc.nameEn }}
                            </div>
                          </div>

                          <!-- Compact Conforme Button -->
                          @if (!isLastDoc) {
                            <button
                              (click)="toggleCompliant(task, doc)"
                              class="shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border shadow-sm active:scale-95 whitespace-nowrap"
                              [class.bg-green-100]="isCompliant(task, doc)"
                              [class.border-green-300]="isCompliant(task, doc)"
                              [class.text-green-800]="isCompliant(task, doc)"
                              [class.bg-white]="!isCompliant(task, doc)"
                              [class.text-slate-500]="!isCompliant(task, doc)"
                              [class.hover:bg-slate-100]="
                                !isCompliant(task, doc)
                              "
                              [class.border-slate-300]="!isCompliant(task, doc)"
                            >
                              Conforme
                            </button>
                          }
                        </div>

                        <!-- Rejection Reasons List -->
                        <div class="p-3 bg-white space-y-1">
                          @if (hasNormalReasons(doc)) {
                            <div
                              class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1"
                            >
                              Motifs de rejet
                            </div>
                            @for (reason of doc.reasons; track reason.id) {
                              @if (
                                shouldShowReason(task, doc, reason) &&
                                !reason.isConfirmation
                              ) {
                                <label
                                  class="flex items-start gap-3 p-2 rounded-lg cursor-pointer transition-all select-none border border-transparent hover:bg-slate-50"
                                  [class.bg-red-50]="
                                    isReasonSelected(doc, reason)
                                  "
                                  [class.border-red-100]="
                                    isReasonSelected(doc, reason)
                                  "
                                >
                                  <div
                                    class="relative flex items-center mt-0.5"
                                  >
                                    <input
                                      type="checkbox"
                                      class="peer h-4 w-4 appearance-none rounded border-2 border-slate-300 bg-white checked:bg-slate-800 checked:border-slate-800 focus:outline-none transition-all"
                                      [checked]="isReasonSelected(doc, reason)"
                                      (change)="toggleReason(task, doc, reason)"
                                    />
                                    <svg
                                      class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity"
                                      xmlns="http://www.w3.org/2000/svg"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      stroke-width="3"
                                      stroke-linecap="round"
                                      stroke-linejoin="round"
                                    >
                                      <polyline
                                        points="20 6 9 17 4 12"
                                      ></polyline>
                                    </svg>
                                  </div>
                                  <span
                                    class="text-xs text-slate-600 leading-snug pt-0.5 transition-colors"
                                    [class.font-semibold]="
                                      isReasonSelected(doc, reason)
                                    "
                                    [class.text-slate-800]="
                                      isReasonSelected(doc, reason)
                                    "
                                    >{{ reason.labelFr }}</span
                                  >
                                </label>
                              }
                            }
                          }

                          @if (hasConfirmationReasons(doc)) {
                            <div
                              class="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-2 ml-1 mt-4"
                            >
                              Besoin de confirmation par courriel
                            </div>
                            @for (reason of doc.reasons; track reason.id) {
                              @if (
                                shouldShowReason(task, doc, reason) &&
                                reason.isConfirmation
                              ) {
                                <label
                                  class="flex items-start gap-3 p-2 rounded-lg cursor-pointer transition-all select-none border border-transparent hover:bg-slate-50"
                                  [class.bg-amber-50]="
                                    isReasonSelected(doc, reason)
                                  "
                                  [class.border-amber-100]="
                                    isReasonSelected(doc, reason)
                                  "
                                >
                                  <div
                                    class="relative flex items-center mt-0.5"
                                  >
                                    <input
                                      type="checkbox"
                                      class="peer h-4 w-4 appearance-none rounded border-2 border-slate-300 bg-white checked:bg-amber-600 checked:border-amber-600 focus:outline-none transition-all"
                                      [checked]="isReasonSelected(doc, reason)"
                                      (change)="toggleReason(task, doc, reason)"
                                    />
                                    <svg
                                      class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity"
                                      xmlns="http://www.w3.org/2000/svg"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      stroke-width="3"
                                      stroke-linecap="round"
                                      stroke-linejoin="round"
                                    >
                                      <polyline
                                        points="20 6 9 17 4 12"
                                      ></polyline>
                                    </svg>
                                  </div>
                                  <span
                                    class="text-xs text-slate-600 leading-snug pt-0.5 transition-colors"
                                    [class.font-semibold]="
                                      isReasonSelected(doc, reason)
                                    "
                                    [class.text-slate-800]="
                                      isReasonSelected(doc, reason)
                                    "
                                    >{{ reason.labelFr }}</span
                                  >
                                </label>
                              }
                            }
                          }
                        </div>
                      </div>
                    }
                  }
                </div>
              } @else {
                <div
                  class="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center opacity-60"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-16 w-16 mb-4 text-slate-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="1.5"
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  <p class="font-medium">Sélectionnez une tâche à gauche</p>
                </div>
              }
            </div>
          </section>
        </div>

        <!-- BOTTOM ROW: Panel 4 (Email & Note) - ONLY VISIBLE IF HAS REJECTIONS OR GENERAL REMINDER IS ACTIVE -->
        @if (
          hasSelectedRejections() ||
          forceGeneralReminder() ||
          allTasksCompliant()
        ) {
          <section
            class="flex-none min-h-[400px] mb-8 bg-white rounded-2xl shadow-xl flex flex-col overflow-hidden border border-white/50 transition-all duration-500 ease-in-out"
          >
            <div
              class="p-4 bg-slate-50 border-b border-slate-200 flex-none z-10 flex justify-between items-center"
            >
              <h2
                class="font-bold text-slate-700 uppercase text-sm tracking-wider flex items-center gap-2"
              >
                <span
                  class="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs"
                  >4</span
                >
                {{
                  allTasksCompliant()
                    ? "Instructions & Note"
                    : "Courriel & Note"
                }}
              </h2>

              <div class="flex items-center gap-3">
                @if (!allTasksCompliant()) {
                  <label
                    class="flex items-center gap-2 text-xs font-semibold text-slate-700 mr-2 cursor-pointer select-none"
                  >
                    <input
                      type="checkbox"
                      class="peer h-4 w-4 appearance-none rounded border border-slate-300 bg-white checked:bg-indigo-600 checked:border-indigo-600 focus:outline-none transition-all"
                      [checked]="sharedState.includeLinkedEmail()"
                      (change)="toggleIncludeReo()"
                    />
                    <span class="relative">
                      <svg
                        class="absolute -left-[1.15rem] top-1/2 -translate-y-1/2 w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="3"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      Inclure réorientation
                    </span>
                  </label>
                }

                <button
                  (click)="copyNote()"
                  class="text-xs bg-white hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-md shadow-sm border border-slate-300 font-semibold transition-all active:scale-95 flex items-center gap-1.5"
                >
                  @if (copiedNote()) {
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-3.5 w-3.5 text-green-600"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clip-rule="evenodd"
                      />
                    </svg>
                    <span class="text-green-700">Note Copiée!</span>
                  } @else {
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-3.5 w-3.5 text-slate-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                      />
                    </svg>
                    <span>Copier Note</span>
                  }
                </button>

                @if (!allTasksCompliant()) {
                  <button
                    (click)="exportToOutlook()"
                    class="text-xs text-white px-4 py-1.5 rounded-md shadow-md font-medium transition-all active:scale-95 flex items-center gap-2"
                    [class.bg-slate-800]="!copiedEmail()"
                    [class.hover:bg-slate-700]="!copiedEmail()"
                    [class.bg-green-600]="copiedEmail()"
                  >
                    @if (copiedEmail()) {
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fill-rule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clip-rule="evenodd"
                        />
                      </svg>
                      Copié ! Ouverture d'Outlook...
                    } @else {
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                      Exporter vers Outlook
                    }
                  </button>
                }
              </div>
            </div>

            <div class="flex-1 overflow-y-auto p-6 space-y-8 bg-slate-50/30">
              <!-- Note Section -->
              <div
                class="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div
                  class="bg-slate-100/80 px-4 py-3 border-b border-slate-200 flex justify-between items-center backdrop-blur-sm"
                >
                  <h3
                    class="font-bold text-slate-700 text-sm flex items-center gap-2"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-4 w-4 text-slate-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    Note au Registre (Interne)
                  </h3>
                </div>
                <div class="p-4 bg-slate-50">
                  <textarea
                    readonly
                    class="w-full h-24 bg-transparent text-sm font-mono text-slate-600 resize-none focus:outline-none border-none p-0 leading-relaxed"
                    >{{ generatedNote() }}</textarea
                  >
                </div>
              </div>

              @if (allTasksCompliant()) {
                <!-- Instructions pour le recruteur -->
                <div
                  class="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <div
                    class="bg-slate-100/80 px-4 py-3 border-b border-slate-200 flex justify-between items-center backdrop-blur-sm"
                  >
                    <h3
                      class="font-bold text-slate-700 text-sm flex items-center gap-2"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-4 w-4 text-slate-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Instructions pour le sgt recruteur
                    </h3>
                  </div>
                  <div
                    class="p-8 bg-white text-sm text-slate-800 leading-relaxed font-sans border-none overflow-y-auto max-h-[500px]"
                  >
                    <ol class="list-decimal list-inside space-y-2">
                      <li>
                        S'assurer que la liste de vérification A1 à A35 est bien
                        rempli.
                      </li>
                      <li>
                        Attribuer la tâche : Planifiez votre consultation.
                      </li>
                      <li>
                        Cocher le marqueur : Réservation requise pour une
                        consultation.
                      </li>
                      <li>Ajouter la note au registre du postulant.</li>
                      <li>
                        Envoyé le courriel au postulant contenant le lien vers
                        le Form et le CAF 101.
                      </li>
                    </ol>
                  </div>
                </div>
              } @else {
                <!-- Email Section -->
                <div
                  class="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <div
                    class="bg-slate-100/80 px-4 py-3 border-b border-slate-200 flex justify-between items-center backdrop-blur-sm"
                  >
                    <h3
                      class="font-bold text-slate-700 text-sm flex items-center gap-2"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-4 w-4 text-slate-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                      Courriel au Postulant
                    </h3>
                  </div>
                  <!-- Using innerHTML to render bold, yellow highlights and underlines -->
                  <div
                    class="p-8 bg-white text-sm text-slate-800 leading-relaxed font-sans border-none focus:outline-none overflow-y-auto max-h-[500px]"
                    [innerHTML]="generatedEmailHtml()"
                  ></div>
                </div>
              }
            </div>
          </section>
        }
      </div>
    }
  }

    <!-- Job Search Modal (always rendered, hidden when not shown) -->
    <app-job-search-modal
      [class.hidden]="!showJobSearch()"
      (closeModal)="showJobSearch.set(false)"
    ></app-job-search-modal>
    }
  `,
  styles: [],
})
export class AppComponent implements OnInit {
  private dataService = inject(RecruitmentDataService);
  private emailScenariosService = inject(EmailScenariosService);
  private sanitizer = inject(DomSanitizer);
  private sharedState = inject(SharedStateService);

  // Auth State
  isAuthenticated = signal<boolean>(false);
  passwordInput = signal<string>('');
  authError = signal<boolean>(false);
  showPassword = signal<boolean>(false);

  ngOnInit() {
    const isAuth = localStorage.getItem('marcel_auth');
    if (isAuth === 'true') {
      this.isAuthenticated.set(true);
    }
  }

  async checkPassword(event: Event) {
    event.preventDefault();
    const input = this.passwordInput();
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    if (hashHex === 'e451b183a1513d7363b47a72b705304d4d3f9c024fbc91f9d9594d0258b5af7a') {
      this.isAuthenticated.set(true);
      this.authError.set(false);
      localStorage.setItem('marcel_auth', 'true');
    } else {
      this.authError.set(true);
    }
  }

  // App Stage Management
  stage = signal<AppStage>("intro");
  isUnderAge = signal<boolean>(false);

  // Signature Settings State
  showSignaturePage = signal<boolean>(false);
  showToast = signal<boolean>(false);
  sigFrTemp = "";
  sigEnTemp = "";

  toggleSignatureSettings() {
    this.sigFrTemp = this.sharedState.customSignatureFr();
    this.sigEnTemp = this.sharedState.customSignatureEn();
    this.showSignaturePage.set(true);
  }

  closeSignaturePage() {
    this.showSignaturePage.set(false);
  }

  saveSignatures() {
    this.sharedState.saveSignatures(this.sigFrTemp, this.sigEnTemp);
    this.showToast.set(true);
    setTimeout(() => {
      this.showToast.set(false);
    }, 3000);
  }

  resetSignatures() {
    this.sigFrTemp = DEFAULT_SIG_FR;
    this.sigEnTemp = DEFAULT_SIG_EN;
  }

  // Job Search Modal State
  showJobSearch = signal(false);

  toggleJobSearch() {
    this.showJobSearch.update((v) => !v);
  }

  // Signals
  private allTasks = signal<Task[]>(this.dataService.getTasks());

  selectedTask = signal<Task | null>(null);

  // Set of selected rejection IDs
  selectedRejectionKeys = signal<Set<string>>(new Set());

  // Set of tasks marked as not completed
  taskNotCompletedKeys = signal<Set<string>>(new Set());

  // Set of explicitly Compliant Documents (key: taskName::docName)
  compliantDocKeys = signal<Set<string>>(new Set());

  // UI States for copy feedback
  copiedEmail = signal(false);
  copiedNote = signal(false);

  @ViewChild(JobSearchModalComponent) jobSearchModal!: JobSearchModalComponent;

  constructor() {
    // No task selected initially, waiting for stage selection
    effect(() => {
      this.sharedState.taskNote.set(this.generatedNote());
      this.sharedState.taskEmailHtmlFr.set(this.getRawHtmlString());
      this.sharedState.taskEmailFr.set(this.generatedEmailPlain());
      this.sharedState.hasReassignedTasks.set(!this.allTasksCompliant());
    });
  }

  toggleIncludeReo() {
    this.sharedState.includeLinkedEmail.update((v) => !v);
  }

  // --- STAGE LOGIC ---

  restartApp() {
    this.stage.set("intro");
    this.isUnderAge.set(false);
    this.selectedTask.set(null);
    this.selectedRejectionKeys.set(new Set());
    this.taskNotCompletedKeys.set(new Set());
    this.compliantDocKeys.set(new Set());
    this.forceGeneralReminder.set(false);
  }

  setAllCompliant() {
    const keys = new Set<string>();
    this.visibleTasks().forEach((task) => {
      task.documents.forEach((doc) => {
        keys.add(this.getDocKey(task, doc));
      });
    });
    this.compliantDocKeys.set(keys);
    this.taskNotCompletedKeys.set(new Set());
    this.selectedRejectionKeys.set(new Set());
    this.forceGeneralReminder.set(false);
  }

  // Computed Tasks based on Stage
  visibleTasks = computed(() => {
    const currentStage = this.stage();
    const tasks = this.allTasks();

    if (currentStage === "intro") {
      return [];
    }

    if (currentStage === "minor-check") {
      // In Minor check, we only want Birth Certificate and Parental Consent tasks.
      // The "Partie H" is now inside "Consentement du parent", so we don't need the general App Form task here.
      return tasks.filter(
        (t) =>
          t.nameFr.includes("Certificat de naissance") ||
          t.nameFr.includes("Consentement du parent"),
      );
    }

    // Main Stage: Exclude Parental Consent
    return tasks.filter((t) => !t.nameFr.includes("Consentement du parent"));
  });

  // Action: User clicks "Oui" (Minor)
  startMinorCheck() {
    this.isUnderAge.set(true);
    this.stage.set("minor-check");
    const tasks = this.visibleTasks();
    if (tasks.length > 0) this.selectTask(tasks[0]);
  }

  // Action: User clicks "Non" (Adult) or finishes minor check
  startMainProgram() {
    if (this.stage() === "intro") {
      this.isUnderAge.set(false);
    }
    this.stage.set("main");
    const tasks = this.visibleTasks();
    if (tasks.length > 0) this.selectTask(tasks[0]);
  }

  // Check if the 4 specific minor documents are compliant
  isMinorCheckComplete = computed(() => {
    const keys = this.compliantDocKeys();

    // Convert to array explicitly typed as string[] to avoid TS inference issues
    const keysArray = Array.from(keys) as string[];

    // 1. Certificat de naissance (Check parents)
    const hasBirthCert = keysArray.some(
      (k) =>
        k.includes("Certificat de naissance") &&
        k.includes("::Certificat de naissance"),
    );

    // 2. Parent ID (Inside Consent task)
    const hasParentId = keysArray.some(
      (k) =>
        k.includes("Consentement du parent") &&
        k.includes("::Pièce d'identité du parent"),
    );

    // 3. Parent Selfie (Inside Consent task)
    const hasParentSelfie = keysArray.some(
      (k) =>
        k.includes("Consentement du parent") &&
        (k.includes("::Selfie du parent") || k.includes("::Égoportrait (Selfie) du parent")),
    );

    // 4. Formulaire demande Partie H (Inside Consent task now)
    const hasPartH = keysArray.some(
      (k) =>
        k.includes("Consentement du parent") &&
        k.includes("::Formulaire de demande d'emploi - Partie H"),
    );

    return hasBirthCert && hasParentId && hasParentSelfie && hasPartH;
  });

  // --- CORE LOGIC ---

  // Actions
  selectTask(task: Task) {
    this.selectedTask.set(task);
  }

  toggleTaskNotCompleted(task: Task) {
    const willBeNotCompleted = !this.isTaskNotCompleted(task);

    this.taskNotCompletedKeys.update((set) => {
      const newSet = new Set(set);
      if (newSet.has(task.nameFr)) {
        newSet.delete(task.nameFr);
      } else {
        newSet.add(task.nameFr);
      }
      return newSet;
    });

    if (willBeNotCompleted) {
      // Clear compliant keys for all documents in this task
      this.compliantDocKeys.update((set) => {
        const newSet = new Set(set);
        task.documents.forEach((doc) => {
          newSet.delete(this.getDocKey(task, doc));
        });
        return newSet;
      });

      // Clear selected rejection reasons for all documents in this task
      this.selectedRejectionKeys.update((set) => {
        const newSet = new Set(set);
        task.documents.forEach((doc) => {
          doc.reasons.forEach((reason) => {
            newSet.delete(this.getReasonKey(doc, reason));
          });
        });
        return newSet;
      });
    }
  }

  isTaskNotCompleted(task: Task): boolean {
    return this.taskNotCompletedKeys().has(task.nameFr);
  }

  toggleReason(task: Task, doc: DocumentItem, reason: RejectionReason) {
    const reasonKey = this.getReasonKey(doc, reason);

    // If we select a rejection, the document is no longer "Compliant"
    this.setCompliantState(task, doc, false);

    this.selectedRejectionKeys.update((set) => {
      const newSet = new Set(set);
      if (newSet.has(reasonKey)) {
        newSet.delete(reasonKey);
      } else {
        newSet.add(reasonKey);
      }
      return newSet;
    });
  }

  // Toggle "Conforme" state
  toggleCompliant(task: Task, doc: DocumentItem) {
    if (this.isCompliant(task, doc)) {
      // If already compliant, toggle OFF
      this.setCompliantState(task, doc, false);
    } else {
      // If turning ON:
      // 1. Clear rejections (cannot be both compliant and rejected)
      this.selectedRejectionKeys.update((set) => {
        const newSet = new Set(set);
        doc.reasons.forEach((r) => {
          newSet.delete(this.getReasonKey(doc, r));
        });
        return newSet;
      });

      // 2. Set Compliant State explicitly
      this.setCompliantState(task, doc, true);
    }
  }

  // Helpers
  private getReasonKey(doc: DocumentItem, reason: RejectionReason): string {
    return `${doc.nameFr}::${reason.id}`;
  }

  private getDocKey(task: Task, doc: DocumentItem): string {
    return `${task.nameFr}::${doc.nameFr}`;
  }

  private setCompliantState(
    task: Task,
    doc: DocumentItem,
    isCompliant: boolean,
  ) {
    const key = this.getDocKey(task, doc);
    this.compliantDocKeys.update((set) => {
      const newSet = new Set(set);
      if (isCompliant) {
        newSet.add(key);
      } else {
        newSet.delete(key);
      }
      return newSet;
    });
  }

  // State Checkers
  isReasonSelected(doc: DocumentItem, reason: RejectionReason): boolean {
    return this.selectedRejectionKeys().has(this.getReasonKey(doc, reason));
  }

  hasRejections(doc: DocumentItem): boolean {
    return doc.reasons.some((r) => this.isReasonSelected(doc, r));
  }

  hasConfirmationReasons(doc: DocumentItem): boolean {
    return doc.reasons.some((r) => r.isConfirmation);
  }

  hasNormalReasons(doc: DocumentItem): boolean {
    return doc.reasons.some((r) => !r.isConfirmation);
  }

  // A document is Compliant only if explicitly marked so
  isCompliant(task: Task, doc: DocumentItem): boolean {
    return this.compliantDocKeys().has(this.getDocKey(task, doc));
  }

  isTaskCompliant(task: Task): boolean {
    const isIdentity = task.nameFr.startsWith("Pièce d'identité avec photo");

    if (isIdentity) {
      const hasSelfie = task.documents.some(
        (d) =>
          d.nameFr.toLowerCase().includes("selfie") &&
          this.isCompliant(task, d),
      );
      const hasId = task.documents.some(
        (d) =>
          !d.nameFr.toLowerCase().includes("selfie") &&
          d !== task.documents[task.documents.length - 1] &&
          this.isCompliant(task, d),
      );
      return hasSelfie && hasId;
    }

    const isConsentement = task.nameFr.includes("Consentement du parent");
    if (isConsentement) {
      return task.documents
        .filter((d) => d !== task.documents[task.documents.length - 1])
        .every((d) => this.isCompliant(task, d));
    }

    // For other tasks, it's compliant if any 1 document is compliant
    return task.documents.some(
      (d) =>
        this.isCompliant(task, d) &&
        d !== task.documents[task.documents.length - 1],
    );
  }

  allTasksCompliant = computed(() => {
    const tasks = this.visibleTasks();
    if (tasks.length === 0) return false;
    return tasks.every((task) => {
      // Le formulaire MDN 2977 n'est pas obligatoire pour la conformité finale
      if (task.nameFr.includes("MDN 2977")) {
        return true;
      }
      return this.isTaskCompliant(task);
    });
  });

  // A document is "Active" if it is either Compliant OR has Rejections
  isDocActive(task: Task, doc: DocumentItem): boolean {
    return this.isCompliant(task, doc) || this.hasRejections(doc);
  }

  // LOGIC: Visibility of documents based on Task rules
  shouldShowDoc(task: Task, doc: DocumentItem): boolean {
    if (this.isTaskNotCompleted(task)) {
      return false;
    }

    // NEW: Minor Check Logic for "Certificat de naissance"
    // In minor check, we only want the actual "Certificat de naissance" (long form), not citizenship card/PR card.
    if (
      this.stage() === "minor-check" &&
      task.nameFr.startsWith("Certificat de naissance")
    ) {
      return doc.nameFr === "Certificat de naissance";
    }

    // 1. If this specific document is active (being worked on), always show it.
    if (this.isDocActive(task, doc)) return true;

    // 2. Logic for "Pièce d'identité"
    // Rule: If one ID is active, hide other IDs. Always keep Selfie visible.
    if (task.nameFr.startsWith("Pièce d'identité")) {
      const isSelfie = doc.nameFr.toLowerCase().includes("selfie");

      // Always show selfie
      if (isSelfie) return true;

      // For other IDs: Check if ANY other NON-SELFIE document is active
      const otherMainIdActive = task.documents.some(
        (d) =>
          d !== doc &&
          !d.nameFr.toLowerCase().includes("selfie") &&
          this.isDocActive(task, d),
      );

      // If another main ID is active, hide this one.
      return !otherMainIdActive;
    }

    // 3. Logic for "Certificat de naissance" (Normal Mode)
    // Rule: If one document is active, hide the others.
    if (task.nameFr.startsWith("Certificat de naissance")) {
      const otherActive = task.documents.some(
        (d) => d !== doc && this.isDocActive(task, d),
      );
      return !otherActive;
    }

    // Default: Show everything
    return true;
  }

  // LOGIC: Visibility of reasons based on Stage (NEW)
  shouldShowReason(
    task: Task,
    doc: DocumentItem,
    reason: RejectionReason,
  ): boolean {
    // The previous complex logic for Part H is removed because the reasons have been moved
    // to the appropriate task in the data structure itself.
    return true;
  }

  hasSelectedRejections = computed(
    () =>
      this.selectedRejectionKeys().size > 0 ||
      this.taskNotCompletedKeys().size > 0,
  );

  // General Reminder State
  forceGeneralReminder = signal(false);

  toggleGeneralReminder() {
    this.forceGeneralReminder.update((v) => !v);
  }

  // Triage Medical State
  triageMedicalRequis = signal(false);

  toggleTriageMedical() {
    this.triageMedicalRequis.update((v) => !v);
  }

  // Computed Content Generators

  // Helper to structure selected rejections by Task -> Items
  private getStructuredRejections() {
    const selectedKeys = this.selectedRejectionKeys();
    const taskNotCompletedKeys = this.taskNotCompletedKeys();
    // Use Map to preserve insertion order of tasks
    const tasksMap = new Map<
      Task,
      { doc: DocumentItem; reason: RejectionReason }[]
    >();

    // Iterate over all tasks instead of only visible tasks to include minor check rejections
    for (const task of this.allTasks()) {
      const isVisible = this.visibleTasks().some(vt => vt.nameFr === task.nameFr);
      
      const hasRejections = task.documents.some(doc => 
        doc.reasons.some(reason => selectedKeys.has(this.getReasonKey(doc, reason)))
      );
      const isNotCompleted = taskNotCompletedKeys.has(task.nameFr);

      if (!isVisible && !hasRejections && !isNotCompleted) {
        continue;
      }

      if (isNotCompleted) {
        tasksMap.set(task, []);
      }
      for (const doc of task.documents) {
        for (const reason of doc.reasons) {
          if (selectedKeys.has(this.getReasonKey(doc, reason))) {
            if (!tasksMap.has(task)) {
              tasksMap.set(task, []);
            }
            tasksMap.get(task)!.push({ doc, reason });
          }
        }
      }
    }
    return tasksMap;
  }

  generatedNote = computed(() => {
    if (this.allTasksCompliant()) {
      return "Étape 1 (En cours) -Big ACE admissible pour les métiers xxx, xxx, xxx. \nQD complété, admissible. Webinaire CAF 101 à faire, tâche planifiez votre consultation attribuée.";
    }

    const closureSuffix =
      " Postulant averti de la fermeture de son dossier si aucune action n'est prise d'ici 30 jours.";

    if (
      this.forceGeneralReminder() &&
      this.selectedRejectionKeys().size === 0
    ) {
      return (
        "Courriel de rappel de tâches envoyé au postulant." + closureSuffix
      );
    }

    const selectedKeys = this.selectedRejectionKeys();
    const taskNotCompletedKeys = this.taskNotCompletedKeys();
    const notes: string[] = [];
    let hasNameMismatch = false;
    let hasNormalReassignment = false;

    // We check all selected reasons across all tasks (filtering non-visible ones unless they have rejections)
    for (const task of this.allTasks()) {
      const isVisible = this.visibleTasks().some(vt => vt.nameFr === task.nameFr);
      const isNotCompleted = taskNotCompletedKeys.has(task.nameFr);
      const hasRejections = task.documents.some(doc => 
        doc.reasons.some(reason => selectedKeys.has(this.getReasonKey(doc, reason)))
      );

      if (!isVisible && !hasRejections && !isNotCompleted) {
        continue;
      }

      if (isNotCompleted) {
        notes.push(`Tâche "${task.nameFr}" non complétée`);
        hasNormalReassignment = true;
      }
      for (const doc of task.documents) {
        for (const reason of doc.reasons) {
          if (selectedKeys.has(this.getReasonKey(doc, reason))) {
            notes.push(reason.logNoteFr);
            if (reason.id === "emp_nom_parent") {
              hasNameMismatch = true;
            }
            if (!reason.isConfirmation) {
              hasNormalReassignment = true;
            }
          }
        }
      }
    }

    if (notes.length === 0) return "";

    // Logic: Prefix + Joined Reasons + Suffix (Conditional)
    const combinedReasons = notes.join(" / ");
    const prefix = "Étape 1 (en cours) - ";

    let noteTxt = "";

    // MODIFICATION: Logic for Minor Mode Suffix
    if (this.isUnderAge()) {
      noteTxt = `${prefix}${combinedReasons}. En attente de la confirmation du consentement parental pour continuer le Big ACE.`;
    } else {
      // Logic for Main/Adult Mode
      if (hasNameMismatch) {
        noteTxt = `${prefix}${combinedReasons}.`;
      } else {
        if (hasNormalReassignment) {
          noteTxt = `${prefix}${combinedReasons}, la/les tâches réattribuées et courriel explicatif envoyé.`;
        } else {
          noteTxt = `${prefix}${combinedReasons}.`;
        }
      }
    }

    // Clean up trailing dots and spaces, then append closureSuffix
    if (noteTxt) {
      noteTxt = noteTxt.trim();
      if (noteTxt.endsWith(".")) {
        noteTxt = noteTxt.slice(0, -1);
      }
      noteTxt += "." + closureSuffix;
    }

    if (this.triageMedicalRequis()) {
      noteTxt += "\n\nMÉDICAL - TRIAGE PAR MED CHU REQUIS";
    }

    return noteTxt;
  });

  // Check if current selection triggers a specific Email Scenario
  activeEmailScenario = computed<EmailScenario | null>(() => {
    if (
      this.forceGeneralReminder() &&
      this.selectedRejectionKeys().size === 0
    ) {
      return this.emailScenariosService.getScenario("general_reminder") || null;
    }

    const selectedKeys = this.selectedRejectionKeys();
    const keysArray = Array.from(selectedKeys) as string[];

    // Trigger for "File Closed due to Basic Academic Criteria"
    const fileClosedAcademics = keysArray.some((k) =>
      k.includes("educ_non_admissible"),
    );
    if (fileClosedAcademics) {
      return (
        this.emailScenariosService.getScenario("educ_non_admissible") || null
      );
    }

    // Trigger for "Parental Consent Required"
    // Checks for 'naiss_parents' (Birth Cert) OR 'emp_nom_parent' (Now in Consent Task)
    const needsParentalConsent = keysArray.some(
      (k) => k.includes("naiss_parents") || k.includes("emp_nom_parent"),
    );

    if (needsParentalConsent) {
      return (
        this.emailScenariosService.getScenario("parental_consent_required") ||
        null
      );
    }

    return null;
  });

  // Plain Text Version (for fallback)
  generatedEmailPlain = computed(() => {
    // 1. Check if scenario is active
    const scenario = this.activeEmailScenario();
    if (scenario) {
      return this.sharedState.getCustomizedScenarioText(scenario.bodyText);
    }

    // 2. Default Logic
    const structure = this.getStructuredRejections();
    if (structure.size === 0) return "";

    const normalTasks = new Map<
      Task,
      { doc: DocumentItem; reason: RejectionReason }[]
    >();
    const confirmationTasks = new Map<
      Task,
      { doc: DocumentItem; reason: RejectionReason }[]
    >();

    for (const [task, items] of structure.entries()) {
      const normalItems = items.filter((i) => !i.reason.isConfirmation);
      const confItems = items.filter((i) => i.reason.isConfirmation);

      if (
        normalItems.length > 0 ||
        this.taskNotCompletedKeys().has(task.nameFr)
      ) {
        normalTasks.set(task, normalItems);
      }
      if (confItems.length > 0) {
        confirmationTasks.set(task, confItems);
      }
    }

    let emailFr = `English message will follow.\n\nBonjour,`;

    if (normalTasks.size > 0) {
      emailFr += `\n\nNous avons procédé à l'évaluation de vos documents. Bien que votre dossier progresse, certains éléments ne sont pas conformes et nécessitent des corrections de votre part pour nous permettre de poursuivre le traitement.\n\nLes tâches suivantes vous ont été réattribuées :`;
      for (const [task, items] of normalTasks.entries()) {
        const taskNameFr = task.nameFr;
        emailFr += `\n\n• ${taskNameFr}`;
        if (this.taskNotCompletedKeys().has(task.nameFr)) {
          emailFr += `\n    ◦ Vous n'avez pas complété cette tâche sur votre portail.`;
          emailFr += `\n      → Veuillez vous connecter à votre portail et la compléter.`;
        }
        for (const item of items) {
          let docNameFr = item.doc.nameFr;
          emailFr += `\n    ◦ ${docNameFr} : ${item.reason.labelFr}`;
          emailFr += `\n      → ${item.reason.instructionFr.replace(/\n/g, "\n        ")}`;
        }
      }
    }

    if (confirmationTasks.size > 0) {
      if (normalTasks.size > 0) {
        emailFr += `\n\nDe plus, nous avons besoin d'une confirmation de votre part. Veuillez répondre directement à ce courriel avec les informations demandées pour l'élément suivant :`;
      } else {
        emailFr += `\n\nAfin de poursuivre le traitement de votre dossier, nous avons besoin d'une confirmation de votre part. Veuillez répondre directement à ce courriel avec les informations demandées pour l'élément suivant :`;
      }
      for (const [task, items] of confirmationTasks.entries()) {
        for (const item of items) {
          let docNameFr = item.doc.nameFr;
          emailFr += `\n\n• ${docNameFr} : ${item.reason.labelFr}`;
          emailFr += `\n  → ${item.reason.instructionFr.replace(/\n/g, "\n    ")}`;
        }
      }
    }

    if (this.forceGeneralReminder()) {
      emailFr += `\n\nVeuillez également vous assurer de compléter les autres tâches manquantes sur votre portail.`;
    }

    emailFr += `\n\nEn raison du volume élevé de candidatures, nous devons prioriser le traitement des dossiers dont toutes les tâches sont complétées.\n\nRendez-vous sur votre portail pour les compléter : https://www.cafoap-pclfac.forces.gc.ca/`;
    emailFr += `\n\nSi vous ne prenez aucune action, votre dossier sera désactivé automatiquement après 30 jours.`;

    emailFr += `\n\n` + this.sharedState.customSignatureFr();

    // English Part
    let emailEn = `Hello,`;

    if (normalTasks.size > 0) {
      emailEn += `\n\nWe have evaluated your documents. While your application is progressing, some items are not compliant and require corrections on your part to allow us to continue processing.\n\nThe following tasks have been reassigned to you:`;
      for (const [task, items] of normalTasks.entries()) {
        const taskNameEn = task.nameEn;
        emailEn += `\n\n• ${taskNameEn}`;
        if (this.taskNotCompletedKeys().has(task.nameFr)) {
          emailEn += `\n    ◦ You have not completed this task on your portal.`;
          emailEn += `\n      → Please log in to your portal and complete it.`;
        }
        for (const item of items) {
          let docNameEn = item.doc.nameEn;
          emailEn += `\n    ◦ ${docNameEn} : ${item.reason.labelEn}`;
          emailEn += `\n      → ${item.reason.instructionEn.replace(/\n/g, "\n        ")}`;
        }
      }
    }

    if (confirmationTasks.size > 0) {
      if (normalTasks.size > 0) {
        emailEn += `\n\nFurthermore, we require confirmation from you. Please reply directly to this email with the requested information for the following item:`;
      } else {
        emailEn += `\n\nTo continue processing your application, we require confirmation from you. Please reply directly to this email with the requested information for the following item:`;
      }
      for (const [task, items] of confirmationTasks.entries()) {
        for (const item of items) {
          let docNameEn = item.doc.nameEn;
          emailEn += `\n\n• ${docNameEn} : ${item.reason.labelEn}`;
          emailEn += `\n  → ${item.reason.instructionEn.replace(/\n/g, "\n    ")}`;
        }
      }
    }

    if (this.forceGeneralReminder()) {
      emailEn += `\n\nPlease also ensure that you complete the other missing tasks on your portal.`;
    }

    emailEn += `\n\nDue to the high volume of applications, we must prioritize the processing of files where all tasks are complete.\n\nPlease log in to your portal to complete them: https://www.cafoap-pclfac.forces.gc.ca/`;
    emailEn += `\n\nIf you take no action, your file will be automatically deactivated after 30 days.`;

    emailEn += `\n\n` + this.sharedState.customSignatureEn();

    return `${emailFr}\n\n______________________________________________________________________________\n\n${emailEn}`;
  });

  // HTML Version (for rich text display and Copy/Paste)
  generatedEmailHtml = computed((): SafeHtml => {
    // 1. Check if scenario is active
    const scenario = this.activeEmailScenario();
    if (scenario) {
      const customBodyHtml = this.sharedState.getCustomizedScenarioHtml(scenario.bodyHtml);
      return this.sanitizer.bypassSecurityTrustHtml(customBodyHtml);
    }

    // 2. Default Logic
    const rawHtml = this.getRawHtmlString();
    return this.sanitizer.bypassSecurityTrustHtml(rawHtml);
  });

  // Helper to get raw HTML string for clipboard and display
  private getRawHtmlString(): string {
    const structure = this.getStructuredRejections();
    if (structure.size === 0) return "";

    const normalTasks = new Map<
      Task,
      { doc: DocumentItem; reason: RejectionReason }[]
    >();
    const confirmationTasks = new Map<
      Task,
      { doc: DocumentItem; reason: RejectionReason }[]
    >();

    for (const [task, items] of structure.entries()) {
      const normalItems = items.filter((i) => !i.reason.isConfirmation);
      const confItems = items.filter((i) => i.reason.isConfirmation);

      if (
        normalItems.length > 0 ||
        this.taskNotCompletedKeys().has(task.nameFr)
      ) {
        normalTasks.set(task, normalItems);
      }
      if (confItems.length > 0) {
        confirmationTasks.set(task, confItems);
      }
    }

    // Base style
    let html = `<div style="font-family: Calibri, sans-serif; font-size: 11pt; color: #000;">`;

    // --- FRENCH BLOCK ---
    html += `<p><span style="background-color: yellow;">English message will follow.</span></p>`;
    html += `<p>Bonjour,</p>`;

    if (normalTasks.size > 0) {
      html += `<p>Nous avons procédé à l'évaluation de vos documents. Bien que votre dossier progresse, certains éléments ne sont pas conformes et nécessitent des corrections de votre part pour nous permettre de poursuivre le traitement.</p>`;
      html += `<p>Les tâches suivantes vous ont été réattribuées :</p>`;
      html += `<ul style="margin-top: 0;">`;
      for (const [task, items] of normalTasks.entries()) {
        const taskNameFr = task.nameFr;
        html += `<li style="margin-bottom: 15px;"><strong>${taskNameFr}</strong>`;
        html += `<ul style="margin-top: 5px; list-style-type: circle;">`;
        if (this.taskNotCompletedKeys().has(task.nameFr)) {
          html += `<li style="margin-bottom: 10px;">`;
          html += `<span style="color: #FF0000; background-color: yellow; padding: 0 2px;">Vous n'avez pas complété cette tâche sur votre portail.</span>`;
          html += `<br><span style="margin-left: 20px; background-color: yellow; padding: 0 2px;">&rarr; Veuillez vous connecter à votre portail et la compléter.</span>`;
          html += `</li>`;
        }
        for (const item of items) {
          let docNameFr = item.doc.nameFr;
          html += `<li style="margin-bottom: 10px;">`;
          html += `<span style="background-color: yellow; padding: 0 2px;">${docNameFr} : <span style="color: #FF0000;">${item.reason.labelFr}</span></span>`;
          html += `<br><span style="margin-left: 20px; background-color: yellow; padding: 0 2px;">&rarr; ${item.reason.instructionFr.replace(/\n/g, "<br>&nbsp;&nbsp;&nbsp;&nbsp;")}</span>`;
          html += `</li>`;
        }
        html += `</ul></li>`;
      }
      html += `</ul>`;
    }

    if (confirmationTasks.size > 0) {
      if (normalTasks.size > 0) {
        html += `<p>De plus, nous avons besoin d'une confirmation de votre part. Veuillez répondre directement à ce courriel avec les informations demandées pour l'élément suivant :</p>`;
      } else {
        html += `<p>Afin de poursuivre le traitement de votre dossier, nous avons besoin d'une confirmation de votre part. Veuillez répondre directement à ce courriel avec les informations demandées pour l'élément suivant :</p>`;
      }
      html += `<ul style="margin-top: 0; list-style-type: none; padding-left: 0;">`;
      for (const [task, items] of confirmationTasks.entries()) {
        for (const item of items) {
          let docNameFr = item.doc.nameFr;
          html += `<li style="margin-bottom: 15px; margin-left: 10px;"><strong>&bull; <span style="background-color: yellow; padding: 0 2px;">${docNameFr} : <span style="color: #d97706;">${item.reason.labelFr}</span></span></strong>`;
          html += `<br><span style="margin-left: 15px; background-color: yellow; padding: 0 2px;">&rarr; ${item.reason.instructionFr.replace(/\n/g, "<br>&nbsp;&nbsp;&nbsp;&nbsp;")}</span>`;
          html += `</li>`;
        }
      }
      html += `</ul>`;
    }

    if (this.forceGeneralReminder()) {
      html += `<p>Veuillez également vous assurer de compléter les autres tâches manquantes sur votre portail.</p>`;
    }

    html += `<p>En raison du volume élevé de candidatures, nous devons prioriser le traitement des dossiers dont toutes les tâches sont complétées.</p>`;
    html += `<p>Rendez-vous sur votre portail pour les compléter : <a href="https://www.cafoap-pclfac.forces.gc.ca/">https://www.cafoap-pclfac.forces.gc.ca/</a></p>`;
    html += `<p><strong>Si vous ne prenez aucune action, votre dossier sera désactivé automatiquement après 30 jours.</strong></p>`;

    html += `<p>` + this.sharedState.getHtmlSignatureFr() + `</p>`;

    html += `<br><p>______________________________________________________________________________</p><br>`;

    // --- ENGLISH BLOCK ---
    html += `<p>Hello,</p>`;

    if (normalTasks.size > 0) {
      html += `<p>We have evaluated your documents. While your application is progressing, some items are not compliant and require corrections on your part to allow us to continue processing.</p>`;
      html += `<p>The following tasks have been reassigned to you:</p>`;
      html += `<ul style="margin-top: 0;">`;
      for (const [task, items] of normalTasks.entries()) {
        const taskNameEn = task.nameEn;
        html += `<li style="margin-bottom: 15px;"><strong>${taskNameEn}</strong>`;
        html += `<ul style="margin-top: 5px; list-style-type: circle;">`;
        if (this.taskNotCompletedKeys().has(task.nameFr)) {
          html += `<li style="margin-bottom: 10px;">`;
          html += `<span style="color: #FF0000; background-color: yellow; padding: 0 2px;">You have not completed this task on your portal.</span>`;
          html += `<br><span style="margin-left: 20px; background-color: yellow; padding: 0 2px;">&rarr; Please log in to your portal and complete it.</span>`;
          html += `</li>`;
        }
        for (const item of items) {
          let docNameEn = item.doc.nameEn;
          html += `<li style="margin-bottom: 10px;">`;
          html += `<span style="background-color: yellow; padding: 0 2px;">${docNameEn} : <span style="color: #FF0000;">${item.reason.labelEn}</span></span>`;
          html += `<br><span style="margin-left: 20px; background-color: yellow; padding: 0 2px;">&rarr; ${item.reason.instructionEn.replace(/\n/g, "<br>&nbsp;&nbsp;&nbsp;&nbsp;")}</span>`;
          html += `</li>`;
        }
        html += `</ul></li>`;
      }
      html += `</ul>`;
    }

    if (confirmationTasks.size > 0) {
      if (normalTasks.size > 0) {
        html += `<p>Furthermore, we require confirmation from you. Please reply directly to this email with the requested information for the following item:</p>`;
      } else {
        html += `<p>To continue processing your application, we require confirmation from you. Please reply directly to this email with the requested information for the following item:</p>`;
      }
      html += `<ul style="margin-top: 0; list-style-type: none; padding-left: 0;">`;
      for (const [task, items] of confirmationTasks.entries()) {
        for (const item of items) {
          let docNameEn = item.doc.nameEn;
          html += `<li style="margin-bottom: 15px; margin-left: 10px;"><strong>&bull; <span style="background-color: yellow; padding: 0 2px;">${docNameEn} : <span style="color: #d97706;">${item.reason.labelEn}</span></span></strong>`;
          html += `<br><span style="margin-left: 15px; background-color: yellow; padding: 0 2px;">&rarr; ${item.reason.instructionEn.replace(/\n/g, "<br>&nbsp;&nbsp;&nbsp;&nbsp;")}</span>`;
          html += `</li>`;
        }
      }
      html += `</ul>`;
    }

    if (this.forceGeneralReminder()) {
      html += `<p>Please also ensure that you complete the other missing tasks on your portal.</p>`;
    }

    html += `<p>Due to the high volume of applications, we must prioritize the processing of files where all tasks are complete.</p>`;
    html += `<p>Please log in to your portal to complete them: <a href="https://www.cafoap-pclfac.forces.gc.ca/">https://www.cafoap-pclfac.forces.gc.ca/</a></p>`;
    html += `<p><strong>If you take no action, your file will be automatically deactivated after 30 days.</strong></p>`;

    html += `<p>` + this.sharedState.getHtmlSignatureEn() + `</p>`;

    html += `</div>`;

    return html;
  }

  // Combined Action: Copy HTML to clipboard AND Open Empty Outlook Window
  async exportToOutlook() {
    // 1. Copy to Clipboard
    try {
      // Logic for Scenario vs Default
      const scenario = this.activeEmailScenario();

      let htmlContent: string;
      let textContent: string;
      const subject = "Forces armées canadiennes/Canadian Armed Forces";

      if (scenario) {
        htmlContent = this.sharedState.getCustomizedScenarioHtml(scenario.bodyHtml);
        textContent = this.sharedState.getCustomizedScenarioText(scenario.bodyText);
      } else {
        htmlContent = this.getRawHtmlString();
        textContent = this.generatedEmailPlain();
      }

      // Modern Clipboard API supporting HTML
      if (navigator.clipboard && navigator.clipboard.write) {
        const typeHtml = "text/html";
        const typeText = "text/plain";

        const blobHtml = new Blob([htmlContent], { type: typeHtml });
        const blobText = new Blob([textContent], { type: typeText });

        const data = [
          new ClipboardItem({
            [typeHtml]: blobHtml,
            [typeText]: blobText,
          }),
        ];

        await navigator.clipboard.write(data);
      } else {
        // Fallback
        await navigator.clipboard.writeText(textContent);
      }

      this.copiedEmail.set(true);
      setTimeout(() => this.copiedEmail.set(false), 3000);

      // 2. Open Outlook
      const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}`;
      window.location.href = mailtoLink;
    } catch (err) {
      console.error("Failed to copy", err);
    }
  }

  async copyNote() {
    try {
      await navigator.clipboard.writeText(this.generatedNote());
      this.copiedNote.set(true);
      setTimeout(() => this.copiedNote.set(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  }
}
