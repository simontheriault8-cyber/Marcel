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
import { JobDatabaseService } from "./services/job-database.service";
import { JobEntry } from "./services/jobs-data";
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
          class="absolute top-4 right-16 bg-indigo-100 border border-indigo-200 text-indigo-800 hover:bg-indigo-200 h-10 w-10 rounded-full shadow-md transition-all z-50 font-sans flex items-center justify-center text-sm font-black"
          title="Panneau de Réorientation et Métiers"
        >
          RÉO
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
        <div class="flex items-start w-full shrink-0 gap-4">
          <!-- BIG ACE Panel (Top-Left 2x2 Round Buttons) -->
          <div
            class="bg-white p-3 rounded-2xl shadow-md border border-slate-200 flex flex-col items-center gap-2 shrink-0"
          >
            <h1
              class="text-xs font-black tracking-widest text-slate-800 uppercase text-center border-b border-slate-100 pb-1.5 w-full px-1"
            >
              BIG ACE
            </h1>

            <div class="grid grid-cols-2 gap-2">
              <!-- Top-Left: Reset -->
              <button
                (click)="restartApp()"
                class="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 shadow-sm transition-all flex items-center justify-center border border-slate-200 active:scale-95 cursor-pointer"
                title="Relancer l'application (Reset)"
              >
                <svg
                  class="h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  <path d="M3 3v5h5" />
                </svg>
              </button>

              <!-- Top-Right: Réo -->
              <button
                (click)="toggleJobSearch()"
                class="w-9 h-9 rounded-full bg-indigo-100 hover:bg-indigo-200 text-indigo-800 border border-indigo-200 shadow-sm transition-all flex items-center justify-center text-xs font-black active:scale-95 cursor-pointer"
                title="Panneau de Réorientation et Métiers (RÉO)"
              >
                RÉO
              </button>

              <!-- Bottom-Left: Signature -->
              <button
                (click)="toggleSignatureSettings()"
                class="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 shadow-sm transition-all flex items-center justify-center border border-slate-200 active:scale-95 cursor-pointer"
                title="Gestion de la signature"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </button>

              <!-- Bottom-Right: Rappel Général -->
              <button
                (click)="toggleGeneralReminder()"
                class="w-9 h-9 rounded-full border shadow-sm transition-all flex items-center justify-center active:scale-95 cursor-pointer"
                [class.bg-indigo-600]="forceGeneralReminder()"
                [class.text-white]="forceGeneralReminder()"
                [class.border-indigo-700]="forceGeneralReminder()"
                [class.hover:bg-indigo-700]="forceGeneralReminder()"
                [class.bg-slate-100]="!forceGeneralReminder()"
                [class.text-slate-700]="!forceGeneralReminder()"
                [class.border-slate-200]="!forceGeneralReminder()"
                [class.hover:bg-slate-200]="!forceGeneralReminder()"
                title="Courriel de rappel général"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </button>
            </div>
          </div>

          <!-- Panel: Métiers au dossier du postulant -->
          <div
            class="bg-white p-3 rounded-2xl shadow-md border border-slate-200 flex flex-col gap-2 flex-1 min-w-[320px]"
          >
            <div class="flex items-center justify-between border-b border-slate-100 pb-1.5 px-1">
              <h2 class="text-xs font-black tracking-wider text-slate-800 uppercase flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4 text-indigo-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                Métiers au dossier du postulant
              </h2>
            </div>

            <!-- 3 Columns for 3 Jobs -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-2.5">
              <!-- Slot 1 -->
              <div class="relative flex flex-col gap-1 p-2 bg-slate-50/80 border border-slate-200 rounded-xl">
                <div class="flex items-center justify-between text-[11px] font-bold">
                  <span class="uppercase tracking-wider text-slate-500">Choix #1</span>
                  @if (getDossierJob(1)) {
                    @let job1 = getDossierJob(1)!;
                    @if (isJobClosed(job1.id)) {
                      <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1">
                        <span class="w-1.5 h-1.5 rounded-full bg-rose-600"></span>Fermé
                      </span>
                    } @else {
                      <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                        <span class="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>Ouvert
                      </span>
                    }
                  }
                </div>

                <div class="relative">
                  <div
                    class="flex items-center border border-slate-300 rounded-lg bg-white shadow-xs focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 text-xs min-h-[34px]"
                    [class.opacity-50]="isDossierFieldDisabled(1)"
                    [class.bg-slate-100]="isDossierFieldDisabled(1)"
                    [class.cursor-not-allowed]="isDossierFieldDisabled(1)"
                  >
                    <input
                      type="text"
                      [ngModel]="sharedState.searchDossierQuery1()"
                      (ngModelChange)="onDossierQueryChange(1, $event)"
                      (focus)="openDossierDropdown(1)"
                      (blur)="closeDossierDropdownDelayed(1)"
                      [disabled]="isDossierFieldDisabled(1)"
                      class="w-full px-2.5 py-1.5 text-xs outline-none bg-transparent font-medium text-slate-800"
                      [class.cursor-not-allowed]="isDossierFieldDisabled(1)"
                      placeholder="Rechercher métier #1..."
                    />
                    @if (sharedState.selectedDossierJobId1() && !isDossierFieldDisabled(1)) {
                      <button
                        (click)="clearDossierJob(1, $event)"
                        class="p-1 px-2 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                        title="Effacer le choix #1"
                      >
                        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    }
                  </div>

                  <!-- Dropdown List -->
                  @if (dossierDropdownOpen1() && !isDossierFieldDisabled(1)) {
                    <div class="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-48 overflow-y-auto divide-y divide-slate-100 text-xs">
                      @let filtered1 = getFilteredJobsForIndex(1);
                      @if (filtered1.length === 0) {
                        <div class="p-2 text-slate-400 text-center italic">Aucun métier trouvé</div>
                      }
                      @for (job of filtered1; track job.id) {
                        <button
                          type="button"
                          (mousedown)="selectDossierJob(1, job.id)"
                          class="w-full text-left px-2.5 py-1.5 hover:bg-indigo-50 flex items-center justify-between gap-2 transition cursor-pointer"
                        >
                          <span class="font-medium text-slate-800 truncate">{{ job.id }} - {{ job.title }}</span>
                          @if (isJobClosed(job.id)) {
                            <span class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-100 text-rose-700 shrink-0">Fermé</span>
                          } @else {
                            <span class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-700 shrink-0">Ouvert</span>
                          }
                        </button>
                      }
                    </div>
                  }
                </div>
              </div>

              <!-- Slot 2 -->
              <div class="relative flex flex-col gap-1 p-2 bg-slate-50/80 border border-slate-200 rounded-xl">
                <div class="flex items-center justify-between text-[11px] font-bold">
                  <span class="uppercase tracking-wider text-slate-500">Choix #2</span>
                  @if (getDossierJob(2)) {
                    @let job2 = getDossierJob(2)!;
                    @if (isJobClosed(job2.id)) {
                      <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1">
                        <span class="w-1.5 h-1.5 rounded-full bg-rose-600"></span>Fermé
                      </span>
                    } @else {
                      <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                        <span class="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>Ouvert
                      </span>
                    }
                  }
                </div>

                <div class="relative">
                  <div
                    class="flex items-center border border-slate-300 rounded-lg bg-white shadow-xs focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 text-xs min-h-[34px]"
                    [class.opacity-50]="isDossierFieldDisabled(2)"
                    [class.bg-slate-100]="isDossierFieldDisabled(2)"
                    [class.cursor-not-allowed]="isDossierFieldDisabled(2)"
                  >
                    <input
                      type="text"
                      [ngModel]="sharedState.searchDossierQuery2()"
                      (ngModelChange)="onDossierQueryChange(2, $event)"
                      (focus)="openDossierDropdown(2)"
                      (blur)="closeDossierDropdownDelayed(2)"
                      [disabled]="isDossierFieldDisabled(2)"
                      class="w-full px-2.5 py-1.5 text-xs outline-none bg-transparent font-medium text-slate-800"
                      [class.cursor-not-allowed]="isDossierFieldDisabled(2)"
                      placeholder="Rechercher métier #2..."
                    />
                    @if (sharedState.selectedDossierJobId2() && !isDossierFieldDisabled(2)) {
                      <button
                        (click)="clearDossierJob(2, $event)"
                        class="p-1 px-2 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                        title="Effacer le choix #2"
                      >
                        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    }
                  </div>

                  <!-- Dropdown List -->
                  @if (dossierDropdownOpen2() && !isDossierFieldDisabled(2)) {
                    <div class="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-48 overflow-y-auto divide-y divide-slate-100 text-xs">
                      @let filtered2 = getFilteredJobsForIndex(2);
                      @if (filtered2.length === 0) {
                        <div class="p-2 text-slate-400 text-center italic">Aucun métier trouvé</div>
                      }
                      @for (job of filtered2; track job.id) {
                        <button
                          type="button"
                          (mousedown)="selectDossierJob(2, job.id)"
                          class="w-full text-left px-2.5 py-1.5 hover:bg-indigo-50 flex items-center justify-between gap-2 transition cursor-pointer"
                        >
                          <span class="font-medium text-slate-800 truncate">{{ job.id }} - {{ job.title }}</span>
                          @if (isJobClosed(job.id)) {
                            <span class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-100 text-rose-700 shrink-0">Fermé</span>
                          } @else {
                            <span class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-700 shrink-0">Ouvert</span>
                          }
                        </button>
                      }
                    </div>
                  }
                </div>
              </div>

              <!-- Slot 3 -->
              <div class="relative flex flex-col gap-1 p-2 bg-slate-50/80 border border-slate-200 rounded-xl">
                <div class="flex items-center justify-between text-[11px] font-bold">
                  <span class="uppercase tracking-wider text-slate-500">Choix #3</span>
                  @if (getDossierJob(3)) {
                    @let job3 = getDossierJob(3)!;
                    @if (isJobClosed(job3.id)) {
                      <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1">
                        <span class="w-1.5 h-1.5 rounded-full bg-rose-600"></span>Fermé
                      </span>
                    } @else {
                      <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                        <span class="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>Ouvert
                      </span>
                    }
                  }
                </div>

                <div class="relative">
                  <div
                    class="flex items-center border border-slate-300 rounded-lg bg-white shadow-xs focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 text-xs min-h-[34px]"
                    [class.opacity-50]="isDossierFieldDisabled(3)"
                    [class.bg-slate-100]="isDossierFieldDisabled(3)"
                    [class.cursor-not-allowed]="isDossierFieldDisabled(3)"
                  >
                    <input
                      type="text"
                      [ngModel]="sharedState.searchDossierQuery3()"
                      (ngModelChange)="onDossierQueryChange(3, $event)"
                      (focus)="openDossierDropdown(3)"
                      (blur)="closeDossierDropdownDelayed(3)"
                      [disabled]="isDossierFieldDisabled(3)"
                      class="w-full px-2.5 py-1.5 text-xs outline-none bg-transparent font-medium text-slate-800"
                      [class.cursor-not-allowed]="isDossierFieldDisabled(3)"
                      placeholder="Rechercher métier #3..."
                    />
                    @if (sharedState.selectedDossierJobId3() && !isDossierFieldDisabled(3)) {
                      <button
                        (click)="clearDossierJob(3, $event)"
                        class="p-1 px-2 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                        title="Effacer le choix #3"
                      >
                        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    }
                  </div>

                  <!-- Dropdown List -->
                  @if (dossierDropdownOpen3() && !isDossierFieldDisabled(3)) {
                    <div class="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-48 overflow-y-auto divide-y divide-slate-100 text-xs">
                      @let filtered3 = getFilteredJobsForIndex(3);
                      @if (filtered3.length === 0) {
                        <div class="p-2 text-slate-400 text-center italic">Aucun métier trouvé</div>
                      }
                      @for (job of filtered3; track job.id) {
                        <button
                          type="button"
                          (mousedown)="selectDossierJob(3, job.id)"
                          class="w-full text-left px-2.5 py-1.5 hover:bg-indigo-50 flex items-center justify-between gap-2 transition cursor-pointer"
                        >
                          <span class="font-medium text-slate-800 truncate">{{ job.id }} - {{ job.title }}</span>
                          @if (isJobClosed(job.id)) {
                            <span class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-100 text-rose-700 shrink-0">Fermé</span>
                          } @else {
                            <span class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-700 shrink-0">Ouvert</span>
                          }
                        </button>
                      }
                    </div>
                  }
                </div>
              </div>
            </div>
          </div>

          <!-- Minor Check Banner (if active) -->
          @if (stage() === "minor-check") {
            <div
              class="bg-indigo-900 text-white p-3.5 rounded-2xl shadow-md flex justify-between items-center flex-1 self-center"
            >
              <div class="flex items-center gap-3">
                <span
                  class="bg-indigo-700 px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider"
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

        <!-- SPLIT COLUMN LAYOUT: Tasks sidebar (left) and Documents Workspace (right) -->
        <div class="flex-1 flex gap-4 min-h-[600px] min-h-0">
          <!-- Panel 1: Navigation (Tasks) -->
          <nav
            class="w-[340px] shrink-0 bg-white rounded-2xl shadow-xl flex flex-col overflow-hidden border border-white/50"
          >
            <div class="p-3 bg-slate-50 border-b border-slate-200 flex-none flex items-center justify-between">
              <h2
                class="font-bold text-slate-700 uppercase text-xs sm:text-sm tracking-wider flex items-center gap-2"
              >
                Tâches du Portail
              </h2>
              <!-- Tout Conforme Button -->
              <button
                (click)="setAllCompliant()"
                class="px-2 py-1.5 rounded-lg shadow-sm transition-all flex items-center gap-1.5 font-bold text-xs border active:scale-95 cursor-pointer"
                [class.bg-emerald-600]="areAllDocsCompliant()"
                [class.text-white]="areAllDocsCompliant()"
                [class.border-emerald-700]="areAllDocsCompliant()"
                [class.hover:bg-emerald-700]="areAllDocsCompliant()"
                [class.bg-emerald-50]="!areAllDocsCompliant()"
                [class.text-emerald-700]="!areAllDocsCompliant()"
                [class.border-emerald-100]="!areAllDocsCompliant()"
                [class.hover:bg-emerald-100]="!areAllDocsCompliant()"
                [class.hover:border-emerald-200]="!areAllDocsCompliant()"
                [title]="areAllDocsCompliant() ? 'Désactiver la conformité de toutes les tâches' : 'Mettre toutes les tâches instantanément conformes'"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-3.5 w-3.5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clip-rule="evenodd"
                  />
                </svg>
                <span>Tout Conforme</span>
              </button>
            </div>
            <div class="flex-1 overflow-y-auto p-3 space-y-4">
              @for (group of groupedVisibleTasks().groups; track group.id) {
                <div class="space-y-1 bg-slate-100/70 p-2 rounded-xl border-2 border-slate-200/90 shadow-xs">
                  <!-- Collapsible Header -->
                  <button
                    (click)="toggleGroupCollapse(group.id)"
                    class="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold tracking-wider text-slate-800 bg-slate-200/80 hover:bg-slate-300/80 transition-colors select-none border border-slate-300/70"
                  >
                    <span class="flex items-center gap-2">
                      <span class="bg-slate-800 text-white px-2 py-0.5 rounded text-[11px] font-extrabold tracking-wide">Groupe {{ group.title }}</span>
                      <span class="text-[11px] font-semibold text-slate-500">({{ group.tasks.length }} {{ group.tasks.length > 1 ? 'tâches' : 'tâche' }})</span>
                      @if (isGroupCompliant(group)) {
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          class="h-4 w-4 text-green-600 shrink-0"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fill-rule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clip-rule="evenodd"
                          />
                        </svg>
                      } @else if (hasGroupRejections(group)) {
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          class="h-4 w-4 text-red-600 shrink-0"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fill-rule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clip-rule="evenodd"
                          />
                        </svg>
                      }
                    </span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-4 w-4 transition-transform duration-200 text-slate-600"
                      [class.rotate-180]="isGroupCollapsed(group.id)"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      stroke-width="2.5"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  <!-- Grouped Tasks -->
                  @if (!isGroupCollapsed(group.id)) {
                    <div class="space-y-1 mt-1">
                      @for (task of group.tasks; track task.nameFr) {
                        <button
                          (click)="selectTask(task)"
                          class="w-full text-left p-2.5 rounded-lg transition-all duration-200 border border-transparent group relative overflow-hidden flex justify-between items-center"
                          [class.bg-slate-800]="selectedTask() === task"
                          [class.text-white]="selectedTask() === task"
                          [class.shadow-md]="selectedTask() === task"
                          [class.hover:bg-slate-200/80]="selectedTask() !== task"
                          [class.bg-white]="selectedTask() !== task"
                        >
                          <div class="font-semibold text-xs pr-2 leading-snug">
                            {{ task.nameFr }}
                          </div>

                          <div class="flex items-center gap-1.5 shrink-0">
                            @if (!task.nameFr.includes("Documents Supplémentaires")) {
                              @if (isTaskCompliant(task)) {
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  class="h-4 w-4 text-green-500 shrink-0"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fill-rule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clip-rule="evenodd"
                                  />
                                </svg>
                              } @else if (hasTaskRejections(task)) {
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  class="h-4 w-4 text-red-500 shrink-0"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fill-rule="evenodd"
                                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                    clip-rule="evenodd"
                                  />
                                </svg>
                              }
                            }
                            @if (selectedTask() === task) {
                              <div class="w-1.5 h-1.5 rounded-full bg-white shrink-0"></div>
                            }
                          </div>
                        </button>
                      }
                    </div>
                  }
                </div>
              }

              <!-- Additional Tasks (Documents Supplémentaires) separated by line -->
              @for (task of groupedVisibleTasks().additionalTasks; track task.nameFr) {
                <hr class="my-3 border-t-2 border-slate-300" />
                <button
                  (click)="selectTask(task)"
                  class="w-full text-left p-3 rounded-xl transition-all duration-200 border border-transparent group relative overflow-hidden flex justify-between items-center bg-white hover:bg-slate-100"
                  [class.bg-slate-800]="selectedTask() === task"
                  [class.text-white]="selectedTask() === task"
                  [class.shadow-md]="selectedTask() === task"
                >
                  <div class="font-semibold text-xs pr-2 leading-snug">
                    {{ task.nameFr }}
                  </div>
                  <div class="flex items-center gap-2">
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

                    @if (!task.nameFr.includes("Documents Supplémentaires")) {
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
                    }
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

                  @if (task.nameFr.includes("Documents Supplémentaires")) {
                    <!-- Header Banner for Dossier Jobs -->
                    <div class="mb-4 p-3 bg-blue-50/80 border border-blue-200 rounded-xl flex items-center justify-between text-xs text-blue-900 shadow-sm">
                      <div class="flex items-center gap-2.5">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <span class="font-bold">Métier(s) au dossier :</span>
                          <span class="ml-1 font-medium">{{ getDossierJobsSummaryTextFr() }}</span>
                        </div>
                      </div>
                    </div>

                    <!-- DOCUMENTS SUPPLÉMENTAIRES SELON LES TÂCHES (Toujours visible) -->
                    @if (hasVisibleTaskBasedDocs(task)) {
                      <div class="mb-6 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-300">
                        <div class="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                          <div class="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            <span>Documents supplémentaires selon la situation du postulant</span>
                          </div>
                        </div>

                        <div class="p-3 bg-white space-y-1">
                          @for (doc of task.documents; track doc.nameFr) {
                            @if (isTaskBasedAdditionalDoc(doc) && shouldShowDoc(task, doc)) {
                              @for (reason of doc.reasons; track reason.id) {
                                @if (shouldShowReason(task, doc, reason)) {
                                  <label
                                    class="flex items-start gap-3 p-2.5 rounded-lg cursor-pointer transition-all select-none border border-transparent hover:bg-slate-50"
                                    [class.bg-blue-50]="isReasonSelected(doc, reason)"
                                    [class.border-blue-100]="isReasonSelected(doc, reason)"
                                  >
                                    <div class="relative flex items-center mt-0.5">
                                      <input
                                        type="checkbox"
                                        class="peer h-4 w-4 appearance-none rounded border-2 border-slate-300 bg-white checked:bg-blue-600 checked:border-blue-600 focus:outline-none transition-all"
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
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                      </svg>
                                    </div>
                                    <div class="flex-1 min-w-0">
                                      <span
                                        class="text-xs text-slate-700 leading-snug block transition-colors"
                                        [class.font-semibold]="isReasonSelected(doc, reason)"
                                        [class.text-blue-900]="isReasonSelected(doc, reason)"
                                      >
                                        <strong class="font-bold text-slate-800">{{ doc.nameFr }} :</strong> {{ reason.labelFr }}
                                      </span>
                                    </div>
                                  </label>
                                }
                              }
                            }
                          }
                        </div>
                      </div>
                    }

                    <!-- ÉTUDES SUBVENTIONNÉES (Toujours visible) -->
                    @if (hasVisibleSubsidizedDocs(task)) {
                      <div class="mb-6 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-300">
                        <div class="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                          <div class="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z" />
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0112 20.055a11.952 11.952 0 01-6.824-2.998 12.078 12.078 0 01-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                            </svg>
                            <span>Études subventionnées</span>
                          </div>
                        </div>

                        <div class="p-3 bg-white space-y-1">
                          @for (doc of task.documents; track doc.nameFr) {
                            @if (isSubsidizedDoc(doc) && shouldShowDoc(task, doc)) {
                              @for (reason of doc.reasons; track reason.id) {
                                @if (shouldShowReason(task, doc, reason)) {
                                  <label
                                    class="flex items-start gap-3 p-2.5 rounded-lg cursor-pointer transition-all select-none border border-transparent hover:bg-slate-50"
                                    [class.bg-blue-50]="isReasonSelected(doc, reason)"
                                    [class.border-blue-100]="isReasonSelected(doc, reason)"
                                  >
                                    <div class="relative flex items-center mt-0.5">
                                      <input
                                        type="checkbox"
                                        class="peer h-4 w-4 appearance-none rounded border-2 border-slate-300 bg-white checked:bg-blue-600 checked:border-blue-600 focus:outline-none transition-all"
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
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                      </svg>
                                    </div>
                                    <div class="flex-1 min-w-0">
                                      <span
                                        class="text-xs text-slate-700 leading-snug block transition-colors"
                                        [class.font-semibold]="isReasonSelected(doc, reason)"
                                        [class.text-blue-900]="isReasonSelected(doc, reason)"
                                      >
                                        <strong class="font-bold text-slate-800">{{ doc.nameFr }} :</strong> {{ reason.labelFr }}
                                      </span>
                                    </div>
                                  </label>
                                }
                              }
                            }
                          }
                        </div>
                      </div>
                    }

                    <!-- DOCUMENTS SUPPLÉMENTAIRES SELON LES MÉTIERS -->
                    @if (hasVisibleAdditionalDocs(task)) {
                      <div class="mb-6 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-300">
                        <div class="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                          <div class="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span>Documents supplémentaires selon les métiers</span>
                          </div>
                        </div>

                        <div class="p-3 bg-white space-y-3">
                          @for (job of getDossierJobObjects(); track job.id) {
                            @if (hasJobAdditionalDocs(task, job)) {
                              <div class="space-y-1 bg-slate-50/80 p-2.5 rounded-xl border border-slate-200/80">
                                <div class="text-xs font-bold text-slate-800 pb-1.5 px-0.5 flex items-center gap-2 border-b border-slate-200/80 mb-1.5">
                                  <span class="inline-block w-2 h-2 rounded-full bg-blue-600"></span>
                                  <span>Pour {{ job.id }} - {{ job.title }} :</span>
                                </div>
                                @for (doc of task.documents; track doc.nameFr) {
                                  @if (!isSubsidizedDoc(doc) && !isTaskBasedAdditionalDoc(doc) && isAdditionalDocRequiredForJob(doc.nameFr, job.id) && shouldShowDoc(task, doc)) {
                                    @for (reason of doc.reasons; track reason.id) {
                                      @if (shouldShowReason(task, doc, reason)) {
                                        <label
                                          class="flex items-start gap-3 p-2 rounded-lg cursor-pointer transition-all select-none border border-transparent hover:bg-white bg-white/70 shadow-2xs"
                                          [class.bg-blue-50]="isJobReasonSelected(job, doc, reason)"
                                          [class.border-blue-200]="isJobReasonSelected(job, doc, reason)"
                                        >
                                          <div class="relative flex items-center mt-0.5">
                                            <input
                                              type="checkbox"
                                              class="peer h-4 w-4 appearance-none rounded border-2 border-slate-300 bg-white checked:bg-blue-600 checked:border-blue-600 focus:outline-none transition-all"
                                              [checked]="isJobReasonSelected(job, doc, reason)"
                                              (change)="toggleJobReason(task, job, doc, reason)"
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
                                              <polyline points="20 6 9 17 4 12"></polyline>
                                            </svg>
                                          </div>
                                          <div class="flex-1 min-w-0">
                                            <span
                                              class="text-xs text-slate-700 leading-snug block transition-colors"
                                              [class.font-semibold]="isJobReasonSelected(job, doc, reason)"
                                              [class.text-blue-900]="isJobReasonSelected(job, doc, reason)"
                                            >
                                              <strong class="font-bold text-slate-800">{{ doc.nameFr }} :</strong> {{ getJobSpecificDocText(job.id, doc.nameFr, true) }}
                                            </span>
                                          </div>
                                        </label>
                                      }
                                    }
                                  }
                                }
                              </div>
                            }
                          }
                        </div>
                      </div>
                    }
                  } @else {
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
                                !reason.isConfirmation &&
                                !reason.isAdditionalDoc
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

                          @if (hasAdditionalDocReasons(doc)) {
                            <div
                              class="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-2 ml-1 mt-4"
                            >
                              Documents supplémentaires
                            </div>
                            @for (reason of doc.reasons; track reason.id) {
                              @if (
                                shouldShowReason(task, doc, reason) &&
                                reason.isAdditionalDoc
                              ) {
                                <label
                                  class="flex items-start gap-3 p-2 rounded-lg cursor-pointer transition-all select-none border border-transparent hover:bg-slate-50"
                                  [class.bg-blue-50]="
                                    isReasonSelected(doc, reason)
                                  "
                                  [class.border-blue-100]="
                                    isReasonSelected(doc, reason)
                                  "
                                >
                                  <div
                                    class="relative flex items-center mt-0.5"
                                  >
                                    <input
                                      type="checkbox"
                                      class="peer h-4 w-4 appearance-none rounded border-2 border-slate-300 bg-white checked:bg-blue-600 checked:border-blue-600 focus:outline-none transition-all"
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
                {{
                  allTasksCompliant()
                    ? "Instructions, Note & Courriel"
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
                      Fusion courriel de Tâche(s) et courriel de Réo
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
              </div>
            </div>

            <div class="flex-1 overflow-y-auto p-6 space-y-8 bg-slate-50/30">
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
                        Attribuer la tâche : Planifiez votre séance d'information des FAC 101.
                      </li>
                      <li>
                        Mettre le marqueur ‘’Dispense requise’’ ou ‘’ÉRA requise’’ au besoin, le Ltv Forest fera l’analyse
                      </li>
                      <li>Ajouter la note au registre du postulant.</li>
                      <li>
                        Envoyé le courriel au postulant contenant le lien vers
                        le Form et le CAF 101.
                      </li>
                    </ol>
                  </div>
                </div>
              }

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
                    >{{ displayedNote() }}</textarea
                  >
                </div>
              </div>

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
  public sharedState = inject(SharedStateService);
  public jobService = inject(JobDatabaseService);

  // Dossier Jobs Panel Dropdown States
  dossierDropdownOpen1 = signal<boolean>(false);
  dossierDropdownOpen2 = signal<boolean>(false);
  dossierDropdownOpen3 = signal<boolean>(false);

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

  // Task Groups Definition & Expansion State
  collapsedGroups = signal<Set<string>>(new Set());

  toggleGroupCollapse(groupId: string) {
    this.collapsedGroups.update((set) => {
      const next = new Set(set);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  }

  isGroupCollapsed(groupId: string): boolean {
    return this.collapsedGroups().has(groupId);
  }

  isGroupCompliant(group: { tasks: Task[] }): boolean {
    return group.tasks.length > 0 && group.tasks.every((t) => this.isTaskCompliant(t));
  }

  hasGroupRejections(group: { tasks: Task[] }): boolean {
    return group.tasks.some((t) => this.hasTaskRejections(t));
  }

  getGroupForTask(task: Task): { id: string; title: string } | null {
    const name = task.nameFr;
    if (name.includes("Documents Supplémentaires")) {
      return null;
    }
    if (
      name.includes("Relevé") ||
      name.includes("Relevés") ||
      name.includes("Pièce d'identité") ||
      name.includes("Certificat de naissance") ||
      name.includes("Consentement du parent")
    ) {
      return { id: "0.1", title: "0.1" };
    }
    if (name.includes("MDN 2977")) {
      return { id: "0.5", title: "0.5" };
    }
    return { id: "1.0", title: "1.0" };
  }

  groupedVisibleTasks = computed(() => {
    const tasks = this.visibleTasks();
    const groups: { id: string; title: string; tasks: Task[] }[] = [
      { id: "0.1", title: "0.1", tasks: [] },
      { id: "0.5", title: "0.5", tasks: [] },
      { id: "1.0", title: "1.0", tasks: [] },
    ];
    const additionalTasks: Task[] = [];

    for (const task of tasks) {
      const g = this.getGroupForTask(task);
      if (!g) {
        additionalTasks.push(task);
      } else {
        const foundGroup = groups.find((grp) => grp.id === g.id);
        if (foundGroup) {
          foundGroup.tasks.push(task);
        }
      }
    }

    return {
      groups: groups.filter((g) => g.tasks.length > 0),
      additionalTasks,
    };
  });

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

  // --- DOSSIER JOBS METHODS ---

  getDossierJob(index: number): JobEntry | undefined {
    const id =
      index === 1
        ? this.sharedState.selectedDossierJobId1()
        : index === 2
        ? this.sharedState.selectedDossierJobId2()
        : this.sharedState.selectedDossierJobId3();
    if (!id) return undefined;
    return this.jobService.getAllJobs().find((j) => j.id === id);
  }

  isJobClosed(jobId: string): boolean {
    return this.jobService.isJobClosed(jobId);
  }

  getFilteredJobsForIndex(index: number): JobEntry[] {
    const query =
      index === 1
        ? this.sharedState.searchDossierQuery1()
        : index === 2
        ? this.sharedState.searchDossierQuery2()
        : this.sharedState.searchDossierQuery3();
    if (!query || query.trim() === "") {
      return this.jobService.getAllJobs();
    }
    return this.jobService.searchJobs(query);
  }

  isDossierFieldDisabled(index: number): boolean {
    const id1 = this.sharedState.selectedDossierJobId1();
    const id2 = this.sharedState.selectedDossierJobId2();
    const id3 = this.sharedState.selectedDossierJobId3();
    if (index === 1) return id2 === "00003" || id3 === "00003";
    if (index === 2) return id1 === "00003" || id3 === "00003";
    if (index === 3) return id1 === "00003" || id2 === "00003";
    return false;
  }

  selectDossierJob(index: number, jobId: string) {
    const qb = this.jobService.getAllJobs().find((j) => j.id === jobId);
    if (!qb) return;

    if (jobId === "00003") {
      if (index === 1) {
        this.sharedState.selectedDossierJobId2.set("");
        this.sharedState.searchDossierQuery2.set("");
        this.sharedState.selectedDossierJobId3.set("");
        this.sharedState.searchDossierQuery3.set("");
      } else if (index === 2) {
        this.sharedState.selectedDossierJobId1.set("");
        this.sharedState.searchDossierQuery1.set("");
        this.sharedState.selectedDossierJobId3.set("");
        this.sharedState.searchDossierQuery3.set("");
      } else if (index === 3) {
        this.sharedState.selectedDossierJobId1.set("");
        this.sharedState.searchDossierQuery1.set("");
        this.sharedState.selectedDossierJobId2.set("");
        this.sharedState.searchDossierQuery2.set("");
      }
    }

    if (index === 1) {
      this.sharedState.selectedDossierJobId1.set(jobId);
      this.sharedState.searchDossierQuery1.set(`${qb.id} - ${qb.title}`);
      this.dossierDropdownOpen1.set(false);
    } else if (index === 2) {
      this.sharedState.selectedDossierJobId2.set(jobId);
      this.sharedState.searchDossierQuery2.set(`${qb.id} - ${qb.title}`);
      this.dossierDropdownOpen2.set(false);
    } else if (index === 3) {
      this.sharedState.selectedDossierJobId3.set(jobId);
      this.sharedState.searchDossierQuery3.set(`${qb.id} - ${qb.title}`);
      this.dossierDropdownOpen3.set(false);
    }
  }

  clearDossierJob(index: number, event?: MouseEvent) {
    if (event) event.stopPropagation();
    if (index === 1) {
      this.sharedState.selectedDossierJobId1.set("");
      this.sharedState.searchDossierQuery1.set("");
      this.dossierDropdownOpen1.set(false);
    } else if (index === 2) {
      this.sharedState.selectedDossierJobId2.set("");
      this.sharedState.searchDossierQuery2.set("");
      this.dossierDropdownOpen2.set(false);
    } else if (index === 3) {
      this.sharedState.selectedDossierJobId3.set("");
      this.sharedState.searchDossierQuery3.set("");
      this.dossierDropdownOpen3.set(false);
    }
  }

  onDossierQueryChange(index: number, val: string) {
    if (index === 1) {
      this.sharedState.searchDossierQuery1.set(val);
      if (!val) this.sharedState.selectedDossierJobId1.set("");
    } else if (index === 2) {
      this.sharedState.searchDossierQuery2.set(val);
      if (!val) this.sharedState.selectedDossierJobId2.set("");
    } else if (index === 3) {
      this.sharedState.searchDossierQuery3.set(val);
      if (!val) this.sharedState.selectedDossierJobId3.set("");
    }
  }

  openDossierDropdown(index: number) {
    if (this.isDossierFieldDisabled(index)) return;
    if (index === 1) {
      this.dossierDropdownOpen1.set(true);
      this.sharedState.searchDossierQuery1.set("");
    } else if (index === 2) {
      this.dossierDropdownOpen2.set(true);
      this.sharedState.searchDossierQuery2.set("");
    } else if (index === 3) {
      this.dossierDropdownOpen3.set(true);
      this.sharedState.searchDossierQuery3.set("");
    }
  }

  closeDossierDropdownDelayed(index: number) {
    setTimeout(() => {
      if (index === 1) {
        this.dossierDropdownOpen1.set(false);
        const id = this.sharedState.selectedDossierJobId1();
        if (id) {
          const qb = this.jobService.getAllJobs().find((j) => j.id === id);
          if (qb) this.sharedState.searchDossierQuery1.set(`${qb.id} - ${qb.title}`);
        } else {
          this.sharedState.searchDossierQuery1.set("");
        }
      } else if (index === 2) {
        this.dossierDropdownOpen2.set(false);
        const id = this.sharedState.selectedDossierJobId2();
        if (id) {
          const qb = this.jobService.getAllJobs().find((j) => j.id === id);
          if (qb) this.sharedState.searchDossierQuery2.set(`${qb.id} - ${qb.title}`);
        } else {
          this.sharedState.searchDossierQuery2.set("");
        }
      } else if (index === 3) {
        this.dossierDropdownOpen3.set(false);
        const id = this.sharedState.selectedDossierJobId3();
        if (id) {
          const qb = this.jobService.getAllJobs().find((j) => j.id === id);
          if (qb) this.sharedState.searchDossierQuery3.set(`${qb.id} - ${qb.title}`);
        } else {
          this.sharedState.searchDossierQuery3.set("");
        }
      }
    }, 200);
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
    this.sharedState.includeLinkedEmail.set(false);
    this.clearDossierJob(1);
    this.clearDossierJob(2);
    this.clearDossierJob(3);
  }

  areAllDocsCompliant = computed(() => {
    const tasks = this.visibleTasks().filter((t) => !t.nameFr.includes("Documents Supplémentaires"));
    if (tasks.length === 0) return false;
    const currentCompliant = this.compliantDocKeys();
    for (const task of tasks) {
      for (const doc of task.documents) {
        if (!currentCompliant.has(this.getDocKey(task, doc))) {
          return false;
        }
      }
    }
    return true;
  });

  setAllCompliant() {
    if (this.areAllDocsCompliant()) {
      // Toggle OFF: désactiver la conformité de toutes les tâches visibles
      const currentKeys = new Set(this.compliantDocKeys());
      this.visibleTasks().forEach((task) => {
        if (!task.nameFr.includes("Documents Supplémentaires")) {
          task.documents.forEach((doc) => {
            currentKeys.delete(this.getDocKey(task, doc));
          });
        }
      });
      this.compliantDocKeys.set(currentKeys);
    } else {
      // Toggle ON: marquer toutes les tâches visibles conformes (sauf Documents Supplémentaires)
      const currentKeys = new Set(this.compliantDocKeys());
      this.visibleTasks().forEach((task) => {
        if (!task.nameFr.includes("Documents Supplémentaires")) {
          task.documents.forEach((doc) => {
            currentKeys.add(this.getDocKey(task, doc));
          });
        }
      });
      this.compliantDocKeys.set(currentKeys);
      this.taskNotCompletedKeys.set(new Set());
      this.selectedRejectionKeys.set(new Set());
      this.forceGeneralReminder.set(false);
    }
  }

  // Helper methods for Dossier Jobs and Additional Documents
  getDossierJobObjects(): JobEntry[] {
    const ids = [
      this.sharedState.selectedDossierJobId1(),
      this.sharedState.selectedDossierJobId2(),
      this.sharedState.selectedDossierJobId3(),
    ].filter((id) => !!id);

    const allJobs = this.jobService.getAllJobs();
    return ids
      .map((id) => allJobs.find((j) => j.id === id))
      .filter((j): j is JobEntry => !!j);
  }

  isSubsidizedEducationJob(job: JobEntry): boolean {
    if (!job) return false;
    const title = (job.title || "").toUpperCase();
    const titleEn = (job.titleEn || "").toUpperCase();
    const programs = (job.contracts || []).map((c) => (c.program || "").toUpperCase()).join(" ");
    const subKeywords = [
      "PFOR", "PFS-MR", "PFOEP", "PFUMR", "PIES-MR", "PMEP", "ESNEM",
      "PFDM", "PFMD", "UTPNCM", "ROTP", "NOCP", "MMTP", "SUBVENTION"
    ];
    if (subKeywords.some((kw) => title.includes(kw) || titleEn.includes(kw) || programs.includes(kw))) return true;
    return false;
  }

  isSubsidizedDoc(doc: DocumentItem): boolean {
    const name = doc.nameFr;
    return (
      name.includes("Lettre d'admission") ||
      name.includes("Plan de cours") ||
      name.includes("Formulaire d'études subventionnées")
    );
  }

  isTaskBasedAdditionalDoc(doc: DocumentItem): boolean {
    const name = doc.nameFr;
    return (
      name.includes("Relevé") ||
      name.includes("Relevés") ||
      name.includes("libération") ||
      name.includes("service antérieur")
    );
  }

  shouldShowAdditionalDoc(doc: DocumentItem): boolean {
    if (this.isSubsidizedDoc(doc)) return true;
    if (this.isTaskBasedAdditionalDoc(doc)) return true;

    const jobs = this.getDossierJobObjects();
    if (jobs.length === 0) return false;

    const docName = doc.nameFr;

    const cvJobIds = [
      "00152", "00155", "00335", "00372", "00378", "00406", "00190", "00194",
      "00195", "00198", "00204", "00374", "00153", "00191", "00349", "00390", "00398"
    ];
    const permitJobIds = [
      "00149", "00161", "00214", "00152", "00153", "00190", "00191", "00194",
      "00195", "00198", "00204", "00335", "00372", "00374", "00390", "00393", "00406"
    ];
    const goodStandingJobIds = [
      "00152", "00153", "00190", "00191", "00194", "00198", "00204", "00335",
      "00372", "00374", "00390", "00393"
    ];
    const specialtyJobIds = [
      "00152", "00191", "00372", "00390", "00393", "00164", "00349"
    ];
    const experienceJobIds = [
      "00137", "00155", "00189", "00203", "00208", "00211", "00166", "00398", "00390"
    ];

    const hasCvJob = jobs.some((j) => cvJobIds.includes(j.id));
    const hasPermitJob = jobs.some((j) => permitJobIds.includes(j.id));
    const hasGoodStandingJob = jobs.some((j) => goodStandingJobIds.includes(j.id));
    const hasSpecialtyJob = jobs.some((j) => specialtyJobIds.includes(j.id));
    const hasExpJob = jobs.some((j) => experienceJobIds.includes(j.id));

    if (docName.includes("Curriculum vitae")) return hasCvJob;
    if (docName.includes("Permis d'exercice")) return hasPermitJob;
    if (docName.includes("Lettre de membre en règle")) return hasGoodStandingJob;
    if (docName.includes("Certificat / Attestation de spécialité")) return hasSpecialtyJob;
    if (docName.includes("Preuve d'expérience spécifique")) return hasExpJob;

    return false;
  }

  isAdditionalDocRequiredForJob(docNameFr: string, jobId: string): boolean {
    const cvJobIds = [
      "00152", "00155", "00335", "00372", "00378", "00406", "00190", "00194",
      "00195", "00198", "00204", "00374", "00153", "00191", "00349", "00390", "00398"
    ];
    const permitJobIds = [
      "00149", "00161", "00214", "00152", "00153", "00190", "00191", "00194",
      "00195", "00198", "00204", "00335", "00372", "00374", "00390", "00393", "00406"
    ];
    const goodStandingJobIds = [
      "00152", "00153", "00190", "00191", "00194", "00198", "00204", "00335",
      "00372", "00374", "00390", "00393"
    ];
    const specialtyJobIds = [
      "00152", "00191", "00372", "00390", "00393", "00164", "00349"
    ];
    const experienceJobIds = [
      "00137", "00155", "00189", "00203", "00208", "00211", "00166", "00398", "00390"
    ];

    if (docNameFr.includes("Curriculum vitae")) return cvJobIds.includes(jobId);
    if (docNameFr.includes("Permis d'exercice")) return permitJobIds.includes(jobId);
    if (docNameFr.includes("Lettre de membre en règle")) return goodStandingJobIds.includes(jobId);
    if (docNameFr.includes("Certificat / Attestation de spécialité")) return specialtyJobIds.includes(jobId);
    if (docNameFr.includes("Preuve d'expérience spécifique")) return experienceJobIds.includes(jobId);

    return false;
  }

  getJobSpecificDocText(jobId: string, docNameFr: string, isFrench: boolean): string {
    if (docNameFr.includes("Curriculum vitae")) {
      if (jobId === "00191") {
        return isFrench
          ? "Curriculum vitae remontant jusqu’à de cinq ans quant à l’expérience en tant que dentiste."
          : "Curriculum vitae going back up to five years regarding experience as a dentist.";
      }
      return isFrench
        ? "Curriculum vitae (CV) récent à jour."
        : "Recent up-to-date Curriculum Vitae (CV).";
    }

    if (docNameFr.includes("Permis d'exercice")) {
      if (jobId === "00149" || jobId === "00161" || jobId === "00214") {
        return isFrench
          ? "Détenir un permis de conduire provincial/territorial en règle."
          : "Hold a valid provincial/territorial driver’s license.";
      }
      if (jobId === "00152") {
        return isFrench
          ? "Fournir un permis ou inscription sans restriction (statut actif) délivré par l’autorité de réglementation provinciale ou territoriale OU une Lettre de conformité (« Good Standing ») émise par l’autorité de réglementation."
          : "Provide an unrestricted license or registration (active status) issued by the provincial or territorial regulatory authority OR a Letter of Good Standing issued by the regulatory authority.";
      }
      if (jobId === "00153") {
        return isFrench
          ? "Fournir soit un permis, une certification ou autorisation sans restriction d’exercer comme technologue en radiation médicale (en règle et en vigueur) provenant d’un organisme de réglementation provincial/territorial reconnu OU la certification d’une association professionnelle ayant conclu une entente réciproque avec l’Association canadienne des technologues en radiation médicale (ACTRM)."
          : "Provide either an unrestricted license, certification, or practice permit to practice as a medical radiation technologist (in good standing and active) from a recognized provincial/territorial regulatory body OR certification from a professional association with a reciprocal agreement with CAMRT.";
      }
      if (jobId === "00190") {
        return isFrench
          ? "Permis/licence d’exercice en règle (à titre actif) en tant que physiothérapeute émis par un organisme de réglementation provincial ou territorial."
          : "Valid (active) license/permit to practice as a physiotherapist issued by a provincial or territorial regulatory body.";
      }
      if (jobId === "00191") {
        return isFrench
          ? "Autorisation en règle et sans restriction d’exercer la Médecine dentaire de la part d’une autorité réglementaire d’une province/d’un territoire du Canada."
          : "Valid and unrestricted license/permit to practice Dentistry from a provincial/territorial regulatory authority in Canada.";
      }
      if (jobId === "00194") {
        return isFrench
          ? "Permis d’exercice de la pharmacie sans restriction en règle."
          : "Valid unrestricted license to practice pharmacy.";
      }
      if (jobId === "00195") {
        return isFrench
          ? "Permis d’exercice en règle (état actif) en soins infirmiers en tant qu’infirmier autorisé ou infirmier en pratique octroyé par un organisme de réglementation provincial ou territorial du Canada."
          : "Valid (active state) nursing practice license as a registered nurse or practical nurse issued by a provincial or territorial regulatory body in Canada.";
      }
      if (jobId === "00198") {
        return isFrench
          ? "Permis en règle et sans restriction (état actif) d’exercer comme travailleur social, délivré par une autorité / association réglementaire provinciale ou territoriale."
          : "Valid and unrestricted license/permit (active state) to practice as a social worker issued by a provincial or territorial regulatory authority/association.";
      }
      if (jobId === "00204") {
        return isFrench
          ? "Autorisé à pratiquer le droit dans une province canadienne ou un territoire canadien."
          : "Authorized to practice law in a Canadian province or territory.";
      }
      if (jobId === "00335") {
        return isFrench
          ? "Fournir une preuve de permis en règle pour agir en tant qu’assistant dentaire délivré par une autorité de réglementation canadienne provinciale ou territoriale."
          : "Provide proof of a valid registration/license as a dental assistant issued by a Canadian provincial or territorial regulatory authority.";
      }
      if (jobId === "00372") {
        return isFrench
          ? "Fournir une preuve de détention d’une autorisation en règle de travailler comme infirmier auxiliaire autorisé/immatriculé émise par un organisme de réglementation provincial ou territorial."
          : "Provide proof of holding a valid registration/license as a licensed/registered practical nurse issued by a provincial or territorial regulatory authority.";
      }
      if (jobId === "00374") {
        return isFrench
          ? "Certificat en règle du Conseil de certification des adjoints au médecin du Canada (CCAMC) et permis/licence en règle (en vigueur) d’exercer comme adjoint au médecin délivré(e) par une autorité réglementaire d’une province ou d’un territoire du Canada."
          : "Valid certification from the Physician Assistant Certification Council of Canada (PACCC) and a valid active license to practice as a physician assistant issued by a provincial or territorial regulatory authority of Canada.";
      }
      if (jobId === "00390") {
        return isFrench
          ? "Permis d’exercice valide et sans restriction pour pratiquer la médecine à titre de spécialiste (selon la spécialité) dans toute province ou tout territoire du Canada."
          : "Valid and unrestricted license to practice medicine as a specialist (according to the specialty) in any province or territory of Canada.";
      }
      if (jobId === "00393") {
        return isFrench
          ? "Détenir une Autorisation en règle et sans restriction d’exercer la Médecine en tant que médecin de famille dans une province ou un territoire du Canada."
          : "Hold a valid and unrestricted license to practice Family Medicine in a province or territory of Canada.";
      }
      if (jobId === "00406") {
        return isFrench
          ? "Fournir une preuve d'inscription actuelle ou en cours au permis ou privilèges hospitaliers de base ou certification en vigueur pour exercer à titre de paramédical(e), délivrés par un organisme de réglementation provincial ou territorial canadien."
          : "Provide proof of current registration/licensure or active base hospital standard privileges or certification to practice as a paramedic, issued by a Canadian provincial or territorial regulatory authority.";
      }
      return isFrench
        ? "Permis d'exercice ou licence professionnelle sans restriction."
        : "Unrestricted practice permit or professional license.";
    }

    if (docNameFr.includes("Lettre de membre en règle")) {
      if (jobId === "00190") {
        return isFrench
          ? "Lettre de l’organisme de réglementation du candidat attestant que ce dernier est « En règle »."
          : "Letter from the candidate's regulatory body confirming they are \"In good standing\".";
      }
      if (jobId === "00191") {
        return isFrench
          ? "Lettre de l’autorité réglementaire professionnelle attestant que le candidat est en règle."
          : "Letter from the professional regulatory authority confirming that the candidate is in good standing.";
      }
      if (jobId === "00204") {
        return isFrench
          ? "Être « membre en règle », en exercice ou non, du Barreau d'une province ou d’un territoire."
          : "Be a \"member in good standing\", practicing or non-practicing, of the Bar of a province or territory.";
      }
      if (jobId === "00374") {
        return isFrench
          ? "Lettre de l’autorité professionnelle réglementaire ou de son superviseur en clinique, selon le cas, attestant que le candidat est en règle."
          : "Letter from the professional regulatory authority or clinical supervisor, as applicable, confirming that the candidate is in good standing.";
      }
      if (jobId === "00390") {
        return isFrench
          ? "Attestation de bonne conduite professionnelle délivrée par l’organisme de réglementation provincial ou territorial du candidat."
          : "Certificate of professional good standing issued by the candidate’s provincial or territorial regulatory body.";
      }
      if (jobId === "00393") {
        return isFrench
          ? "Lettre des autorités de réglementation de la province/territoire du candidat attestant que ce dernier est « en règle »."
          : "Letter from the regulatory authorities of the candidate’s province/territory confirming that the candidate is in \"good standing\".";
      }
      return isFrench
        ? "Fournir une lettre de l'organisme de réglementation de la profession du candidat attestant que ce dernier est « en règle »."
        : "Provide a letter from the professional regulatory body confirming that the candidate is in good standing.";
    }

    if (docNameFr.includes("Certificat / Attestation de spécialité")) {
      if (jobId === "00152") {
        return isFrench
          ? "Fournir soit la certification de la Société canadienne de science de laboratoire médical (SCSLM) OU la certification de l'alliance canadienne des organismes de réglementation des professionnels de laboratoire médical (ACORPLM), incluant la réussite des examens du «TLM généraliste»."
          : "Provide either the certification from the Canadian Society for Medical Laboratory Science (CSMLS) OR the certification from the Canadian Alliance of Medical Laboratory Professionals Regulators (CAMLPR), including successfully passing the 'General MLT' exams.";
      }
      if (jobId === "00191") {
        return isFrench
          ? "Certificat du Bureau national d’examen dentaire du Canada (BNED)."
          : "Certificate from the National Dental Examining Board of Canada (NDEB).";
      }
      if (jobId === "00349") {
        return isFrench
          ? "Accrédité et reconnu comme un leader au sein d’une tradition de foi par l’autorité de gouvernance de cette même tradition de foi qui exerce une supervision au Canada, et tel que recommandé par le membre désigné du CIAMC. Avoir été endossé comme aumônier par le CIAMC. Avoir réussi une entrevue et jugé apte par un comité présidé par le D Svc Aum."
          : "Accredited and recognized as a faith group leader by the governing authority of that faith group which exercises supervision in Canada, and as recommended by the ICCDF. Be endorsed as a chaplain by the ICCDF. Successfully pass an interview and be deemed suitable by a committee chaired by the D Chap Svc.";
      }
      if (jobId === "00372") {
        return isFrench
          ? "Fournir une preuve de certification comme infirmier auxiliaire autorisé/immatriculé en soins peropératoires."
          : "Provide proof of certification as a licensed/registered practical nurse in perioperative care.";
      }
      if (jobId === "00390") {
        return isFrench
          ? "Achèvement d’une formation spécialisée dans un programme de résidence agréé par le Collège royal des médecins et chirurgiens du Canada, et Certification et titre de fellow du Collège royal des médecins et chirurgiens du Canada dans l’une des spécialités médicales requises."
          : "Completion of specialized training in a residency program accredited by the Royal College of Physicians and Surgeons of Canada, and Certification and fellowship designation from the Royal College of Physicians and Surgeons of Canada in one of the required specialties.";
      }
      if (jobId === "00393") {
        return isFrench
          ? "Certification en médecine familiale du Collège des médecins de famille du Canada."
          : "Certification in Family Medicine from the College of Family Physicians of Canada.";
      }
      return isFrench
        ? "Certificat ou attestation officielle de spécialité (BNED, CCAMC, Collège Royal, etc.)"
        : "Official specialty certificate or attestation (NDEB, CACMS, Royal College, etc.)";
    }

    if (docNameFr.includes("Preuve d'expérience spécifique")) {
      if (jobId === "00137") {
        return isFrench
          ? "Expérience dans un ou plusieurs des domaines suivants : photographie, photojournalisme, conception graphique ou multimédia."
          : "Experience in one or more of the following fields: photography, photojournalism, graphic design, or multimedia.";
      }
      if (jobId === "00155") {
        return isFrench
          ? "A travaillé en tant que technologue en électronique biomédicale pendant une période totale d’au moins six (6) mois au cours des deux (2) dernières années."
          : "Had worked as a biomedical electronics technologist for a total period of at least six (6) months within the last two (2) years.";
      }
      if (jobId === "00189") {
        return isFrench
          ? "Au moins trois mois d'expérience pertinente dans un ou plusieurs des domaines suivants : industrie de la construction, gestion des installations, services d'incendies, services de l'environnement, géomatique, gestion de projet, service militaire."
          : "At least three months of relevant experience in one or more of the following fields: construction industry, facility management, fire services, environmental services, geomatics, project management, military service.";
      }
      if (jobId === "00203") {
        return isFrench
          ? "Fournir une preuve d’au moins une (1) année d’expérience cumulative dans deux ou plusieurs des domaines suivants : communications, journalisme, commercialisation, affaires publiques, relations publiques, recherche sur l'opinion publique, médias numériques ou sociaux."
          : "Provide proof of at least one (1) year of cumulative experience in two or more of the following fields: communications, journalism, marketing, public affairs, public relations, public opinion research, digital or social media.";
      }
      if (jobId === "00208") {
        return isFrench
          ? "Au moins une ou plusieurs années de travail à temps plein dans un ou plusieurs des domaines suivants : sélection, recrutement (RH), recherche en sciences sociales, orientation scolaire/professionnelle."
          : "At least one or more years of full-time work in one or more of the following fields: selection, recruitment (HR), social science research, academic/career counseling.";
      }
      if (jobId === "00211") {
        return isFrench
          ? "Fournir une preuve d’au moins trois (3) ans cumulatifs d’expérience à temps plein dans l’un ou plusieurs des domaines suivants : élaboration d’un programme d’études, expert-conseil en éducation, conception de l’instruction, formation du personnel, enseignement/instruction, expert-conseil en instruction, développement de l’instruction."
          : "Provide proof of at least three (3) cumulative years of full-time experience in one or more of the following fields: curriculum development, education consultant, instructional design, staff training, teaching/instruction, instructional consultant, instructional development.";
      }
      if (jobId === "00166") {
        return isFrench
          ? "Fournir une preuve d’expérience comme musicien professionnel dans une variété d’ensembles et dans divers styles de musique, p. ex. à titre de musicien travaillant à son propre compte, ou à temps plein avec une orchestre, un ensemble ou un groupe de musique local."
          : "Provide proof of experience as a professional musician in a variety of ensembles and in various styles of music, e.g. as a self-employed musician, or full-time with a local orchestra, ensemble, or music group.";
      }
      if (jobId === "00390") {
        return isFrench
          ? "Pour toutes les spécialités (à l’exception de la psychiatrie et de la médecine physique et réadaptation) : Être employé à temps plein dans un poste clinique au sein d’un établissement de soins de santé civil."
          : "For all specialties, except psychiatry and physical medicine and rehabilitation (physiatry): Be employed full-time in a clinical position within a civilian healthcare facility.";
      }
      if (jobId === "00398") {
        return isFrench
          ? "Un minimum de deux années d’expérience cumulative en gestion à temps plein au cours des cinq dernières années dans un milieu de soins de santé."
          : "A minimum of two years of cumulative full-time management experience within the last five years in a healthcare setting.";
      }
      return isFrench
        ? "Preuve d'expérience spécifique (gestion, portfolio, accréditation)."
        : "Proof of specific experience (management, portfolio, accreditation).";
    }

    return isFrench ? docNameFr : docNameFr;
  }

  getDisplayLabelForAdditionalDoc(doc: DocumentItem, reason: RejectionReason): string {
    const dossierJobs = this.getDossierJobObjects();
    if (dossierJobs.length > 0) {
      const matchingJobs = dossierJobs.filter((j) =>
        this.isAdditionalDocRequiredForJob(doc.nameFr, j.id)
      );
      if (matchingJobs.length > 0) {
        const texts = matchingJobs.map((j) =>
          this.getJobSpecificDocText(j.id, doc.nameFr, true)
        );
        const uniqueTexts = Array.from(new Set(texts));
        return uniqueTexts.join(" — ");
      }
    }
    return reason.labelFr;
  }

  hasVisibleTaskBasedDocs(task: Task): boolean {
    if (!task || !task.documents) return false;
    return task.documents.some((d) => this.isTaskBasedAdditionalDoc(d) && this.shouldShowDoc(task, d));
  }

  hasVisibleAdditionalDocs(task: Task): boolean {
    if (!task || !task.documents) return false;
    const dossierJobs = this.getDossierJobObjects();
    if (dossierJobs.length === 0) return false;
    return dossierJobs.some((j) => this.hasJobAdditionalDocs(task, j));
  }

  hasJobAdditionalDocs(task: Task, job: JobEntry): boolean {
    if (!task || !task.documents || !job) return false;
    return task.documents.some(
      (d) =>
        !this.isSubsidizedDoc(d) &&
        !this.isTaskBasedAdditionalDoc(d) &&
        this.isAdditionalDocRequiredForJob(d.nameFr, job.id) &&
        this.shouldShowDoc(task, d)
    );
  }

  hasVisibleSubsidizedDocs(task: Task): boolean {
    if (!task || !task.documents) return false;
    return task.documents.some((d) => this.isSubsidizedDoc(d) && this.shouldShowDoc(task, d));
  }

  getDossierJobsSummaryTextFr(): string {
    const jobs = this.getDossierJobObjects();
    if (jobs.length === 0) return "";
    return jobs.map((j) => `${j.title} (${j.id})`).join(", ");
  }

  getDossierJobsSummaryTextEn(): string {
    const jobs = this.getDossierJobObjects();
    if (jobs.length === 0) return "";
    return jobs.map((j) => `${j.titleEn || j.title} (${j.id})`).join(", ");
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
    return tasks.filter((t) => {
      if (t.nameFr.includes("Consentement du parent")) return false;

      return true;
    });
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
        const dossierJobs = this.getDossierJobObjects();
        task.documents.forEach((doc) => {
          doc.reasons.forEach((reason) => {
            newSet.delete(this.getReasonKey(doc, reason));
            dossierJobs.forEach((j) => {
              newSet.delete(this.getJobReasonKey(j, doc, reason));
            });
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
        
        // Uncheck others if "Inexistant au dossier" is selected, and vice versa
        if (reason.id.includes("inexist")) {
          // Uncheck all other reasons for this document
          doc.reasons.forEach(r => {
            if (r.id !== reason.id) {
               newSet.delete(this.getReasonKey(doc, r));
            }
          });
        } else {
          // If we check another reason, uncheck "Inexistant au dossier"
          doc.reasons.forEach(r => {
            if (r.id.includes("inexist")) {
               newSet.delete(this.getReasonKey(doc, r));
            }
          });
        }
      }
      return newSet;
    });
  }

  toggleJobReason(task: Task, job: JobEntry, doc: DocumentItem, reason: RejectionReason) {
    const jobKey = this.getJobReasonKey(job, doc, reason);
    const generalKey = this.getReasonKey(doc, reason);

    this.setCompliantState(task, doc, false);

    this.selectedRejectionKeys.update((set) => {
      const newSet = new Set(set);
      if (newSet.has(generalKey)) {
        newSet.delete(generalKey);
        const dossierJobs = this.getDossierJobObjects();
        for (const j of dossierJobs) {
          if (j.id !== job.id && this.isAdditionalDocRequiredForJob(doc.nameFr, j.id)) {
            newSet.add(this.getJobReasonKey(j, doc, reason));
          }
        }
      } else {
        if (newSet.has(jobKey)) {
          newSet.delete(jobKey);
        } else {
          newSet.add(jobKey);
        }
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
        const dossierJobs = this.getDossierJobObjects();
        doc.reasons.forEach((r) => {
          newSet.delete(this.getReasonKey(doc, r));
          dossierJobs.forEach((j) => {
            newSet.delete(this.getJobReasonKey(j, doc, r));
          });
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

  private getJobReasonKey(job: JobEntry, doc: DocumentItem, reason: RejectionReason): string {
    return `${doc.nameFr}::${reason.id}::${job.id}`;
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
  isJobReasonSelected(job: JobEntry, doc: DocumentItem, reason: RejectionReason): boolean {
    return (
      this.selectedRejectionKeys().has(this.getJobReasonKey(job, doc, reason)) ||
      this.selectedRejectionKeys().has(this.getReasonKey(doc, reason))
    );
  }

  isReasonSelected(doc: DocumentItem, reason: RejectionReason): boolean {
    if (this.selectedRejectionKeys().has(this.getReasonKey(doc, reason))) {
      return true;
    }
    const dossierJobs = this.getDossierJobObjects();
    return dossierJobs.some((j) =>
      this.selectedRejectionKeys().has(this.getJobReasonKey(j, doc, reason))
    );
  }

  hasRejections(doc: DocumentItem): boolean {
    return doc.reasons.some((r) => this.isReasonSelected(doc, r));
  }

  hasConfirmationReasons(doc: DocumentItem): boolean {
    return doc.reasons.some((r) => r.isConfirmation);
  }

  hasAdditionalDocReasons(doc: DocumentItem): boolean {
    return doc.reasons.some((r) => r.isAdditionalDoc);
  }

  hasNormalReasons(doc: DocumentItem): boolean {
    return doc.reasons.some((r) => !r.isConfirmation && !r.isAdditionalDoc);
  }

  // A document is Compliant only if explicitly marked so
  isCompliant(task: Task, doc: DocumentItem): boolean {
    return this.compliantDocKeys().has(this.getDocKey(task, doc));
  }

  hasTaskRejections(task: Task): boolean {
    return (
      this.isTaskNotCompleted(task) ||
      task.documents.some((doc) => this.hasRejections(doc))
    );
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
          this.isCompliant(task, d),
      );
      return hasSelfie && hasId;
    }

    const isConsentement = task.nameFr.includes("Consentement du parent");
    if (isConsentement) {
      return task.documents.every((d) => this.isCompliant(task, d));
    }

    // For other tasks, it's compliant if any 1 document is compliant
    return task.documents.some((d) => this.isCompliant(task, d));
  }

  allTasksCompliant = computed(() => {
    if (this.areAllDocsCompliant()) {
      return true;
    }

    const tasks = this.visibleTasks();
    if (tasks.length === 0) return false;
    return tasks.every((task) => {
      if (task.nameFr.includes("Documents Supplémentaires")) {
        return true;
      }
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

    if (task.nameFr.includes("Documents Supplémentaires")) {
      if (this.isDocActive(task, doc)) return true;
      return this.shouldShowAdditionalDoc(doc);
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
        doc.reasons.some(reason => this.isReasonSelected(doc, reason))
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
          if (this.isReasonSelected(doc, reason)) {
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
      const jobs = this.getDossierJobObjects();
      const jobNumbers = jobs.map((j) => j.id).join(", ");
      const jobsText = jobNumbers ? jobNumbers : "xxx, xxx, xxx";
      return `Étape 1 (En cours) -Big ACE admissible pour les métiers ${jobsText}. \nQD complété, admissible. Webinaire CAF 101 à faire, tâche planifiez votre séance d'information des FAC 101 attribuée.`;
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
        doc.reasons.some(reason => this.isReasonSelected(doc, reason))
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
          if (this.isReasonSelected(doc, reason)) {
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

  displayedNote = computed(() => {
    if (this.sharedState.includeLinkedEmail() && this.sharedState.reoMergedNote()) {
      return this.sharedState.reoMergedNote();
    }
    return this.generatedNote();
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

  getCompliantEmailHtml(): string {
    let html = `<div style="font-family: Calibri, sans-serif; font-size: 11pt; color: #000;">`;

    // --- FRENCH BLOCK ---
    html += `<p><strong>English message will follow.</strong></p>`;
    html += `<p>Bonjour,</p>`;
    html += `<p>Merci beaucoup d’avoir fourni vos documents et fait votre choix de profession.</p>`;
    html += `<p>Afin de pouvoir continuer votre processus, vous devrez <span style="background-color: #00FF00; font-weight: bold; padding: 0 4px;">OBLIGATOIREMENT</span> :</p>`;
    
    html += `<p><strong>1-Vous informer :</strong></p>`;
    html += `<ul style="margin-top: 0; margin-bottom: 15px; list-style-type: disc; padding-left: 20px;">`;
    html += `  <li style="margin-bottom: 5px;">Regarder et comprendre le contenu de la présentation suivante : <a href="https://youtu.be/hYzMRYYBnag" target="_blank" style="color: #4f46e5; text-decoration: underline; font-weight: 500;">Présentation Forces 101</a></li>`;
    html += `  <li style="margin-bottom: 5px;">Regarder la vidéo et description du ou des métier/s pour lesquels vous êtes inscrits <a href="https://forces.ca/fr/carrieres/" target="_blank" style="color: #4f46e5; text-decoration: underline; font-weight: 500;">Carrières | Forces armées canadiennes</a></li>`;
    html += `  <li style="margin-bottom: 5px;">Explorer et bien comprendre la section <a href="https://forces.ca/fr/instruction-de-base/" target="_blank" style="color: #4f46e5; text-decoration: underline; font-weight: 500;">Instruction de base</a> du site Forces.ca</li>`;
    html += `</ul>`;

    html += `<p><strong>2-Après avoir regardé la vidéo, Prendre rendez-vous pour une consultation via le calendrier de votre portail.</strong> <a href="https://www.cafoap-pclfac.forces.gc.ca/" target="_blank" style="color: #4f46e5; text-decoration: underline; font-weight: 500;">Lien vers le Portail d'enrôlement des Forces armées canadiennes</a>&nbsp;<span style="background-color: #00FF00; padding: 0 4px; font-weight: 500;">De nouvelles plages horaires ouvriront d’ici 14 jours sur votre portail.</span></p>`;

    html += `<p>Cette consultation auprès d’un recruteur sera nécessaire afin de valider votre connaissance des professions militaires qui vous intéressent, de la nature du cours de qualification militaire de base (QMB) et des exigences que comporte un engagement au sein de la force régulière des Forces armées canadiennes. Cette consultation n’est pas une entrevue officielle. Lorsque votre dossier sera distribué à un gestionnaire de dossier, celui-ci vous attribuera une tâche pour prendre un rendez-vous avec un conseiller en carrière militaire et c’est avec ce conseiller que vous ferez votre entrevue officielle pour un emploie dans les forces armées canadienne.</p>`;

    html += `<p>Si vous ne prenez aucune action, votre dossier sera désactivé automatiquement après 30 jours.</p>`;
    html += `<p>Merci encore et au plaisir de votre faire votre connaissance.</p>`;

    html += `<p>` + this.sharedState.getHtmlSignatureFr() + `</p>`;

    html += `<br><hr style="border: 0; border-top: 1px solid #ccc; margin: 20px 0;"><br>`;

    // --- ENGLISH BLOCK ---
    html += `<p>Hello,</p>`;
    html += `<p>Thank you very much for providing your documents and selecting your preferred occupation.</p>`;
    html += `<p>In order to continue your application process, You will be <span style="background-color: #00FF00; font-weight: bold; padding: 0 4px;">REQUIRED</span> to:</p>`;

    html += `<p><strong>1- Inform yourself :</strong></p>`;
    html += `<ul style="margin-top: 0; margin-bottom: 15px; list-style-type: disc; padding-left: 20px;">`;
    html += `  <li style="margin-bottom: 5px;">Watch and understand the content of the following presentation: <a href="https://youtu.be/oKuX_ROtASw" target="_blank" style="color: #4f46e5; text-decoration: underline; font-weight: 500;">Forces 101 Presentation</a></li>`;
    html += `  <li style="margin-bottom: 5px;">Watch the video and review the description of the trade(s) you are registered for. <a href="https://forces.ca/en/careers/" target="_blank" style="color: #4f46e5; text-decoration: underline; font-weight: 500;">Careers | Canadian Armed Forces</a></li>`;
    html += `  <li style="margin-bottom: 5px;">Explore and fully understand the <a href="https://forces.ca/en/basic-training/" target="_blank" style="color: #4f46e5; text-decoration: underline; font-weight: 500;">Basic Training</a> section of the Forces.ca website.</li>`;
    html += `</ul>`;

    html += `<p><strong>2-After viewing the video, <span style="font-weight: bold;">Schedule an appointment</span> for a consultation through your portal calendar.</strong> <a href="https://www.cafoap-pclfac.forces.gc.ca/" target="_blank" style="color: #4f46e5; text-decoration: underline; font-weight: 500;">Canadian Armed Forces enrolment Portal link</a>&nbsp;<span style="background-color: #00FF00; padding: 0 4px; font-weight: 500;">New time slots will open on your portal within 14 days.</span></p>`;

    html += `<p>This consultation with a recruiter will be required to validate your understanding of the military occupations that interest you, the nature of the Basic Military Qualification (BMQ), and the requirements associated with enrolling in the Regular Force of the Canadian Armed Forces. This consultation is not an official interview. Once your file has been assigned to a file administrator, you will be given a task to schedule an appointment with a Military Career Counsellor. It is with this counsellor that you will complete your official interview for employment with the Canadian Armed Forces.</p>`;

    html += `<p>If no action is taken, your file will be automatically deactivated after 30 days.</p>`;
    html += `<p>Thank you again, and we look forward to meeting you.</p>`;

    html += `<p>` + this.sharedState.getHtmlSignatureEn() + `</p>`;

    html += `</div>`;
    return html;
  }

  getCompliantEmailPlain(): string {
    let plain = "";

    // --- FRENCH ---
    plain += `English message will follow.\n\n`;
    plain += `Bonjour,\n\n`;
    plain += `Merci beaucoup d’avoir fourni vos documents et fait votre choix de profession.\n\n`;
    plain += `Afin de pouvoir continuer votre processus, vous devrez OBLIGATOIREMENT :\n\n`;
    plain += `1-Vous informer :\n`;
    plain += `•\tRegarder et comprendre le contenu de la présentation suivante : Présentation Forces 101 (https://youtu.be/hYzMRYYBnag)\n`;
    plain += `•\tRegarder la vidéo et description du ou des métier/s pour lesquels vous êtes inscrits Carrières | Forces armées canadiennes (https://forces.ca/fr/carrieres/)\n`;
    plain += `•\tExplorer et bien comprendre la section Instruction de base du site Forces.ca (https://forces.ca/fr/instruction-de-base/)\n\n`;
    plain += `2-Après avoir regardé la vidéo, Prendre rendez-vous pour une consultation via le calendrier de votre portail. Lien vers le Portail d'enrôlement des Forces armées canadiennes (https://www.cafoap-pclfac.forces.gc.ca/) De nouvelles plages horaires ouvriront d’ici 14 jours sur votre portail.\n\n`;
    plain += `Cette consultation auprès d’un recruteur sera nécessaire afin de valider votre connaissance des professions militaires qui vous intéressent, de la nature du cours de qualification militaire de base (QMB) et des exigences que comporte un engagement au sein de la force régulière des Forces armées canadiennes. Cette consultation n’est pas une entrevue officielle. Lorsque votre dossier sera distribué à un gestionnaire de dossier, celui-ci vous attribuera une tâche pour prendre un rendez-vous avec un conseiller en carrière militaire et c’est avec ce conseiller que vous ferez votre entrevue officielle pour un emploie dans les forces armées canadienne.\n\n`;
    plain += `Si vous ne prenez aucune action, votre dossier sera désactivé automatiquement après 30 jours.\n\n`;
    plain += `Merci encore et au plaisir de votre faire votre connaissance.\n\n`;
    plain += this.sharedState.customSignatureFr();

    plain += `\n\n______________________________________________________________________________\n\n`;

    // --- ENGLISH ---
    plain += `Hello,\n\n`;
    plain += `Thank you very much for providing your documents and selecting your preferred occupation.\n\n`;
    plain += `In order to continue your application process, You will be REQUIRED to:\n\n`;
    plain += `1- Inform yourself :\n`;
    plain += `•\tWatch and understand the content of the following presentation: Forces 101 Presentation (https://youtu.be/oKuX_ROtASw)\n`;
    plain += `•\tWatch the video and review the description of the trade(s) you are registered for. Careers | Canadian Armed Forces (https://forces.ca/en/careers/)\n`;
    plain += `•\tExplore and fully understand the Basic Training section of the Forces.ca website (https://forces.ca/en/basic-training/)\n\n`;
    plain += `2-After viewing the video, Schedule an appointment for a consultation through your portal calendar. Canadian Armed Forces enrolment Portal link (https://www.cafoap-pclfac.forces.gc.ca/) New time slots will open on your portal within 14 days.\n\n`;
    plain += `This consultation with a recruiter will be required to validate your understanding of the military occupations that interest you, the nature of the Basic Military Qualification (BMQ), and the requirements associated with enrolling in the Regular Force of the Canadian Armed Forces. This consultation is not an official interview. Once your file has been assigned to a file administrator, you will be given a task to schedule an appointment with a Military Career Counsellor. It is with this counsellor that you will complete your official interview for employment with the Canadian Armed Forces.\n\n`;
    plain += `If no action is taken, your file will be automatically deactivated after 30 days.\n\n`;
    plain += `Thank you again, and we look forward to meeting you.\n\n`;
    plain += this.sharedState.customSignatureEn();

    return plain;
  }

  // Plain Text Version (for fallback)
  generatedEmailPlain = computed(() => {
    if (this.allTasksCompliant()) {
      return this.getCompliantEmailPlain();
    }

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
    const additionalDocTasks = new Map<
      Task,
      { doc: DocumentItem; reason: RejectionReason }[]
    >();

    for (const [task, items] of structure.entries()) {
      const normalItems = items.filter((i) => !i.reason.isConfirmation && !i.reason.isAdditionalDoc);
      const confItems = items.filter((i) => i.reason.isConfirmation && !i.reason.isAdditionalDoc);
      const addItems = items.filter((i) => i.reason.isAdditionalDoc);

      if (
        normalItems.length > 0 ||
        this.taskNotCompletedKeys().has(task.nameFr)
      ) {
        normalTasks.set(task, normalItems);
      }
      if (confItems.length > 0) {
        confirmationTasks.set(task, confItems);
      }
      if (addItems.length > 0) {
        additionalDocTasks.set(task, addItems);
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
        const groupedItems = new Map<any, any[]>();
        for (const item of items) {
          if (!groupedItems.has(item.doc)) groupedItems.set(item.doc, []);
          groupedItems.get(item.doc).push(item);
        }
        for (const [doc, docItems] of groupedItems.entries()) {
          const labels = docItems.map((i: any) => i.reason.labelFr);
          let labelsStr = "";
          if (labels.length === 1) {
            labelsStr = labels[0];
          } else if (labels.length === 2) {
            labelsStr = `${labels[0]} et ${labels[1]}`;
          } else {
            labelsStr = labels.slice(0, -1).join(', ') + ' et ' + labels[labels.length - 1];
          }
          
          emailFr += `\n    ◦ ${doc.nameFr} : ${labelsStr}`;
          
          const uniqueInstructions = new Set<string>();
          for (const item of docItems) {
            if (!uniqueInstructions.has(item.reason.instructionFr)) {
              uniqueInstructions.add(item.reason.instructionFr);
              emailFr += `\n      → ${item.reason.instructionFr.replace(/\n/g, "\n        ")}`;
            }
          }
          const uniqueLinks = new Set<string>();
          for (const item of docItems) {
            if (item.reason.linkFr && !uniqueLinks.has(item.reason.linkFr)) {
              uniqueLinks.add(item.reason.linkFr);
              emailFr += `\n      🔗 ${item.reason.linkFr}`;
            }
          }
          
        }
      }
      emailFr += `\n\nEn raison du volume élevé de candidatures, nous devons prioriser le traitement des dossiers dont toutes les tâches sont complétées.\n\nRendez-vous sur votre portail pour les compléter : https://www.cafoap-pclfac.forces.gc.ca/`;
    }

    if (confirmationTasks.size > 0) {
      if (normalTasks.size > 0) {
        emailFr += `\n\nDe plus, nous avons besoin d'une confirmation de votre part. Veuillez répondre directement à ce courriel avec les informations demandées pour l'élément suivant :`;
      } else {
        emailFr += `\n\nAfin de poursuivre le traitement de votre dossier, nous avons besoin d'une confirmation de votre part. Veuillez répondre directement à ce courriel avec les informations demandées pour l'élément suivant :`;
      }
      for (const [task, items] of confirmationTasks.entries()) {
        const groupedItems = new Map<any, any[]>();
        for (const item of items) {
          if (!groupedItems.has(item.doc)) groupedItems.set(item.doc, []);
          groupedItems.get(item.doc).push(item);
        }
        for (const [doc, docItems] of groupedItems.entries()) {
          const labels = docItems.map((i: any) => i.reason.labelFr);
          let labelsStr = "";
          if (labels.length === 1) {
            labelsStr = labels[0];
          } else if (labels.length === 2) {
            labelsStr = `${labels[0]} et ${labels[1]}`;
          } else {
            labelsStr = labels.slice(0, -1).join(', ') + ' et ' + labels[labels.length - 1];
          }
          
          emailFr += `\n\n• ${doc.nameFr} : ${labelsStr}`;
          
          const uniqueInstructions = new Set<string>();
          for (const item of docItems) {
            if (!uniqueInstructions.has(item.reason.instructionFr)) {
              uniqueInstructions.add(item.reason.instructionFr);
              emailFr += `\n  → ${item.reason.instructionFr.replace(/\n/g, "\n    ")}`;
            }
          }
          const uniqueLinks = new Set<string>();
          for (const item of docItems) {
            if (item.reason.linkFr && !uniqueLinks.has(item.reason.linkFr)) {
              uniqueLinks.add(item.reason.linkFr);
              emailFr += `\n  🔗 ${item.reason.linkFr}`;
            }
          }
          
        }
      }
    }

    if (additionalDocTasks.size > 0) {
      const dossierJobsFr = this.getDossierJobsSummaryTextFr();
      const generalAddDocs: { doc: any; docItems: any[] }[] = [];
      const occupSpecificDocs: { doc: any; docItems: any[] }[] = [];

      for (const [task, items] of additionalDocTasks.entries()) {
        const groupedItems = new Map<any, any[]>();
        for (const item of items) {
          if (!groupedItems.has(item.doc)) groupedItems.set(item.doc, []);
          groupedItems.get(item.doc).push(item);
        }
        for (const [doc, docItems] of groupedItems.entries()) {
          if (this.isSubsidizedDoc(doc) || this.isTaskBasedAdditionalDoc(doc)) {
            generalAddDocs.push({ doc, docItems });
          } else {
            occupSpecificDocs.push({ doc, docItems });
          }
        }
      }

      if (normalTasks.size > 0 || confirmationTasks.size > 0) {
        emailFr += `\n\n--------------------------------------------------`;
      }

      if (generalAddDocs.length > 0) {
        emailFr += `\n\nAfin de compléter l'évaluation de votre demande d'emploi, nous aurons besoin de document(s) supplémentaire(s) :`;
        for (const { doc, docItems } of generalAddDocs) {
          emailFr += `\n\n• ${doc.nameFr}`;
          const uniqueInstructions = new Set<string>();
          for (const item of docItems) {
            if (!uniqueInstructions.has(item.reason.instructionFr)) {
              uniqueInstructions.add(item.reason.instructionFr);
              emailFr += `\n  → ${item.reason.instructionFr.replace(/\n/g, "\n    ")}`;
            }
          }
          const uniqueLinks = new Set<string>();
          for (const item of docItems) {
            if (item.reason.linkFr && !uniqueLinks.has(item.reason.linkFr)) {
              uniqueLinks.add(item.reason.linkFr);
              emailFr += `\n  🔗 ${item.reason.linkFr}`;
            }
          }
        }
      }

      const jobs = this.getDossierJobObjects();
      const jobDocsMapFr = new Map<JobEntry, string[]>();
      for (const job of jobs) {
        const reqs: string[] = [];
        for (const { doc, docItems } of occupSpecificDocs) {
          if (this.isAdditionalDocRequiredForJob(doc.nameFr, job.id)) {
            const isSelectedForJob = docItems.some((item: any) =>
              this.isJobReasonSelected(job, doc, item.reason)
            );
            if (isSelectedForJob) {
              const detail = this.getJobSpecificDocText(job.id, doc.nameFr, true);
              if (detail && !reqs.includes(detail)) {
                reqs.push(detail);
              }
            }
          }
        }
        if (reqs.length > 0) {
          jobDocsMapFr.set(job, reqs);
        }
      }

      if (jobDocsMapFr.size > 0) {
        const selectedJobsFr = Array.from(jobDocsMapFr.keys()).map(j => `${j.title} (${j.id})`).join(', ');
        const jobsHeaderTextFr = selectedJobsFr || dossierJobsFr;
        emailFr += `\n\nAfin d'évaluer votre dossier pour le(s) métier(s) sélectionné(s) (${jobsHeaderTextFr}), vous devez nous fournir le(s) document(s) supplémentaire(s) suivant(s) ou une(des) preuve(s) que vous remplissez la(les) condition(s) suivante(s) en réponse directe à ce courriel :`;
        for (const [job, reqs] of jobDocsMapFr.entries()) {
          emailFr += `\n\n• Pour ${job.id} - ${job.title} : ` + reqs.join(", ");
        }
      }
    }

    if (this.forceGeneralReminder()) {
      emailFr += `\n\nVeuillez également vous assurer de compléter les autres tâches manquantes sur votre portail.`;
    }

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
        const groupedItems = new Map<any, any[]>();
        for (const item of items) {
          if (!groupedItems.has(item.doc)) groupedItems.set(item.doc, []);
          groupedItems.get(item.doc).push(item);
        }
        for (const [doc, docItems] of groupedItems.entries()) {
          const labels = docItems.map((i: any) => i.reason.labelEn);
          let labelsStr = "";
          if (labels.length === 1) {
            labelsStr = labels[0];
          } else if (labels.length === 2) {
            labelsStr = `${labels[0]} and ${labels[1]}`;
          } else {
            labelsStr = labels.slice(0, -1).join(', ') + ' and ' + labels[labels.length - 1];
          }
          
          emailEn += `\n    ◦ ${doc.nameEn} : ${labelsStr}`;
          
          const uniqueInstructions = new Set<string>();
          for (const item of docItems) {
            if (!uniqueInstructions.has(item.reason.instructionEn)) {
              uniqueInstructions.add(item.reason.instructionEn);
              emailEn += `\n      → ${item.reason.instructionEn.replace(/\n/g, "\n        ")}`;
            }
          }
          const uniqueLinks = new Set<string>();
          for (const item of docItems) {
            if (item.reason.linkEn && !uniqueLinks.has(item.reason.linkEn)) {
              uniqueLinks.add(item.reason.linkEn);
              emailEn += `\n      🔗 ${item.reason.linkEn}`;
            }
          }
          
        }
      }
      emailEn += `\n\nDue to the high volume of applications, we must prioritize the processing of files where all tasks are complete.\n\nPlease log in to your portal to complete them: https://www.cafoap-pclfac.forces.gc.ca/`;
    }

    if (confirmationTasks.size > 0) {
      if (normalTasks.size > 0) {
        emailEn += `\n\nFurthermore, we require confirmation from you. Please reply directly to this email with the requested information for the following item:`;
      } else {
        emailEn += `\n\nTo continue processing your application, we require confirmation from you. Please reply directly to this email with the requested information for the following item:`;
      }
      for (const [task, items] of confirmationTasks.entries()) {
        const groupedItems = new Map<any, any[]>();
        for (const item of items) {
          if (!groupedItems.has(item.doc)) groupedItems.set(item.doc, []);
          groupedItems.get(item.doc).push(item);
        }
        for (const [doc, docItems] of groupedItems.entries()) {
          const labels = docItems.map((i: any) => i.reason.labelEn);
          let labelsStr = "";
          if (labels.length === 1) {
            labelsStr = labels[0];
          } else if (labels.length === 2) {
            labelsStr = `${labels[0]} and ${labels[1]}`;
          } else {
            labelsStr = labels.slice(0, -1).join(', ') + ' and ' + labels[labels.length - 1];
          }
          
          emailEn += `\n\n• ${doc.nameEn} : ${labelsStr}`;
          
          const uniqueInstructions = new Set<string>();
          for (const item of docItems) {
            if (!uniqueInstructions.has(item.reason.instructionEn)) {
              uniqueInstructions.add(item.reason.instructionEn);
              emailEn += `\n  → ${item.reason.instructionEn.replace(/\n/g, "\n    ")}`;
            }
          }
          const uniqueLinks = new Set<string>();
          for (const item of docItems) {
            if (item.reason.linkEn && !uniqueLinks.has(item.reason.linkEn)) {
              uniqueLinks.add(item.reason.linkEn);
              emailEn += `\n  🔗 ${item.reason.linkEn}`;
            }
          }
          
        }
      }
    }

    if (additionalDocTasks.size > 0) {
      const dossierJobsEn = this.getDossierJobsSummaryTextEn();
      const generalAddDocs: { doc: any; docItems: any[] }[] = [];
      const occupSpecificDocs: { doc: any; docItems: any[] }[] = [];

      for (const [task, items] of additionalDocTasks.entries()) {
        const groupedItems = new Map<any, any[]>();
        for (const item of items) {
          if (!groupedItems.has(item.doc)) groupedItems.set(item.doc, []);
          groupedItems.get(item.doc).push(item);
        }
        for (const [doc, docItems] of groupedItems.entries()) {
          if (this.isSubsidizedDoc(doc) || this.isTaskBasedAdditionalDoc(doc)) {
            generalAddDocs.push({ doc, docItems });
          } else {
            occupSpecificDocs.push({ doc, docItems });
          }
        }
      }

      if (normalTasks.size > 0 || confirmationTasks.size > 0) {
        emailEn += `\n\n--------------------------------------------------`;
      }

      if (generalAddDocs.length > 0) {
        emailEn += `\n\nIn order to complete the evaluation of your employment application, we will need additional document(s):`;
        for (const { doc, docItems } of generalAddDocs) {
          emailEn += `\n\n• ${doc.nameEn}`;
          const uniqueInstructions = new Set<string>();
          for (const item of docItems) {
            if (!uniqueInstructions.has(item.reason.instructionEn)) {
              uniqueInstructions.add(item.reason.instructionEn);
              emailEn += `\n  → ${item.reason.instructionEn.replace(/\n/g, "\n    ")}`;
            }
          }
          const uniqueLinks = new Set<string>();
          for (const item of docItems) {
            if (item.reason.linkEn && !uniqueLinks.has(item.reason.linkEn)) {
              uniqueLinks.add(item.reason.linkEn);
              emailEn += `\n  🔗 ${item.reason.linkEn}`;
            }
          }
        }
      }

      const jobs = this.getDossierJobObjects();
      const jobDocsMapEn = new Map<JobEntry, string[]>();
      for (const job of jobs) {
        const reqs: string[] = [];
        for (const { doc, docItems } of occupSpecificDocs) {
          if (this.isAdditionalDocRequiredForJob(doc.nameFr, job.id)) {
            const isSelectedForJob = docItems.some((item: any) =>
              this.isJobReasonSelected(job, doc, item.reason)
            );
            if (isSelectedForJob) {
              const detail = this.getJobSpecificDocText(job.id, doc.nameFr, false);
              if (detail && !reqs.includes(detail)) {
                reqs.push(detail);
              }
            }
          }
        }
        if (reqs.length > 0) {
          jobDocsMapEn.set(job, reqs);
        }
      }

      if (jobDocsMapEn.size > 0) {
        const selectedJobsEn = Array.from(jobDocsMapEn.keys()).map(j => `${j.titleEn || j.title} (${j.id})`).join(', ');
        const jobsHeaderTextEn = selectedJobsEn || dossierJobsEn;
        emailEn += `\n\nIn order to evaluate your application for the selected occupation(s) (${jobsHeaderTextEn}), you must provide us with the following additional document(s) or proof that you meet the following condition(s) in direct reply to this email:`;
        for (const [job, reqs] of jobDocsMapEn.entries()) {
          emailEn += `\n\n• For ${job.id} - ${job.titleEn || job.title} : ` + reqs.join(", ");
        }
      }
    }

    if (this.forceGeneralReminder()) {
      emailEn += `\n\nPlease also ensure that you complete the other missing tasks on your portal.`;
    }

    emailEn += `\n\nIf you take no action, your file will be automatically deactivated after 30 days.`;

    emailEn += `\n\n` + this.sharedState.customSignatureEn();

    return `${emailFr}\n\n______________________________________________________________________________\n\n${emailEn}`;
  });

  // HTML Version (for rich text display and Copy/Paste)
  generatedEmailHtml = computed((): SafeHtml => {
    if (this.allTasksCompliant()) {
      return this.sanitizer.bypassSecurityTrustHtml(this.getCompliantEmailHtml());
    }

    // 1. Check if Reo merge is active
    if (this.sharedState.includeLinkedEmail()) {
      const mergedHtml = this.sharedState.reoMergedEmailHtml();
      if (mergedHtml) {
        return this.sanitizer.bypassSecurityTrustHtml(mergedHtml);
      }
    }

    // 2. Check if scenario is active
    const scenario = this.activeEmailScenario();
    if (scenario) {
      const customBodyHtml = this.sharedState.getCustomizedScenarioHtml(scenario.bodyHtml);
      return this.sanitizer.bypassSecurityTrustHtml(customBodyHtml);
    }

    // 3. Default Logic
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
    const additionalDocTasks = new Map<
      Task,
      { doc: DocumentItem; reason: RejectionReason }[]
    >();

    for (const [task, items] of structure.entries()) {
      const normalItems = items.filter((i) => !i.reason.isConfirmation && !i.reason.isAdditionalDoc);
      const confItems = items.filter((i) => i.reason.isConfirmation && !i.reason.isAdditionalDoc);
      const addItems = items.filter((i) => i.reason.isAdditionalDoc);

      if (
        normalItems.length > 0 ||
        this.taskNotCompletedKeys().has(task.nameFr)
      ) {
        normalTasks.set(task, normalItems);
      }
      if (confItems.length > 0) {
        confirmationTasks.set(task, confItems);
      }
      if (addItems.length > 0) {
        additionalDocTasks.set(task, addItems);
      }
    }

    // Base style
    let html = `<div style="font-family: Calibri, sans-serif; font-size: 11pt; color: #000;">`;

    // --- FRENCH BLOCK ---
    html += `<p>English message will follow.</p>`;
    html += `<p>Bonjour,</p>`;
    html += `<!-- START_TASK_BODY_FR -->`;

    if (normalTasks.size > 0) {
      html += `<p>Nous avons procédé à l'évaluation de vos documents. Bien que votre dossier progresse, certains éléments ne sont pas conformes et nécessitent des corrections de votre part pour nous permettre de poursuivre le traitement.</p>`;
      html += `<p>Les tâches suivantes vous ont été réattribuées :</p>`;
      html += `<ul style="margin-top: 0; padding-left: 20px;">`;
      for (const [task, items] of normalTasks.entries()) {
        const taskNameFr = task.nameFr;
        html += `<li style="margin-bottom: 15px;"><span style="text-decoration: underline; font-weight: bold;">${taskNameFr}</span>`;
        html += `<ul style="margin-top: 5px; list-style-type: circle; padding-left: 20px;">`;
        if (this.taskNotCompletedKeys().has(task.nameFr)) {
          html += `<li style="margin-bottom: 10px;">`;
          html += `<span style="color: #FF0000; font-weight: bold;">Vous n'avez pas complété cette tâche sur votre portail.</span>`;
          html += `<div style="margin-left: 20px; margin-top: 4px; color: #000000;">&rarr; Veuillez vous connecter à votre portail et la compléter.</div>`;
          html += `</li>`;
        }
        const groupedItems = new Map<any, any[]>();
        for (const item of items) {
          if (!groupedItems.has(item.doc)) groupedItems.set(item.doc, []);
          groupedItems.get(item.doc).push(item);
        }
        for (const [doc, docItems] of groupedItems.entries()) {
          const labels = docItems.map((i: any) => i.reason.labelFr);
          let labelsStr = "";
          if (labels.length === 1) {
            labelsStr = labels[0];
          } else if (labels.length === 2) {
            labelsStr = `${labels[0]} et ${labels[1]}`;
          } else {
            labelsStr = labels.slice(0, -1).join(', ') + ' et ' + labels[labels.length - 1];
          }
          
          html += `<li style="margin-bottom: 10px;">`;
          html += `<span style="background-color: yellow; padding: 0 2px;"><strong>${doc.nameFr} : <span style="color: #FF0000;">${labelsStr}</span></strong></span>`;
          
          const uniqueInstructions = new Set<string>();
          for (const item of docItems) {
            if (!uniqueInstructions.has(item.reason.instructionFr)) {
              uniqueInstructions.add(item.reason.instructionFr);
              html += `<div style="margin-left: 20px; margin-top: 4px; color: #000000;">&rarr; ${item.reason.instructionFr.replace(/\n/g, "<br>")}</div>`;
            }
          }
          const uniqueLinks = new Set<string>();
          for (const item of docItems) {
            if (item.reason.linkFr && !uniqueLinks.has(item.reason.linkFr)) {
              uniqueLinks.add(item.reason.linkFr);
              html += `<div style="margin-left: 20px; margin-top: 4px; color: #000000;">&#128279; ${item.reason.linkFr}</div>`;
            }
          }
          html += `</li>`;
        }
        html += `</ul></li>`;
      }
      html += `</ul>`;
      html += `<p>En raison du volume élevé de candidatures, nous devons prioriser le traitement des dossiers dont toutes les tâches sont complétées.</p>`;
      html += `<p>Rendez-vous sur votre portail pour les compléter : <a href="https://www.cafoap-pclfac.forces.gc.ca/">https://www.cafoap-pclfac.forces.gc.ca/</a></p>`;
    }

    if (confirmationTasks.size > 0) {
      if (normalTasks.size > 0) {
        html += `<p>De plus, nous avons besoin d'une confirmation de votre part. Veuillez répondre directement à ce courriel avec les informations demandées pour l'élément suivant :</p>`;
      } else {
        html += `<p>Afin de poursuivre le traitement de votre dossier, nous avons besoin d'une confirmation de votre part. Veuillez répondre directement à ce courriel avec les informations demandées pour l'élément suivant :</p>`;
      }
      html += `<ul style="margin-top: 0; list-style-type: disc; padding-left: 20px;">`;
      for (const [task, items] of confirmationTasks.entries()) {
        const groupedItems = new Map<any, any[]>();
        for (const item of items) {
          if (!groupedItems.has(item.doc)) groupedItems.set(item.doc, []);
          groupedItems.get(item.doc).push(item);
        }
        for (const [doc, docItems] of groupedItems.entries()) {
          const labels = docItems.map((i: any) => i.reason.labelFr);
          let labelsStr = "";
          if (labels.length === 1) {
            labelsStr = labels[0];
          } else if (labels.length === 2) {
            labelsStr = `${labels[0]} et ${labels[1]}`;
          } else {
            labelsStr = labels.slice(0, -1).join(', ') + ' et ' + labels[labels.length - 1];
          }
          
          html += `<li style="margin-bottom: 15px;"><span style="background-color: yellow; padding: 0 2px;"><strong>${doc.nameFr} : <span style="color: #d97706;">${labelsStr}</span></strong></span>`;
          
          const uniqueInstructions = new Set<string>();
          for (const item of docItems) {
            if (!uniqueInstructions.has(item.reason.instructionFr)) {
              uniqueInstructions.add(item.reason.instructionFr);
              html += `<div style="margin-left: 20px; margin-top: 4px; color: #000000;">&rarr; ${item.reason.instructionFr.replace(/\n/g, "<br>")}</div>`;
            }
          }
          const uniqueLinks = new Set<string>();
          for (const item of docItems) {
            if (item.reason.linkFr && !uniqueLinks.has(item.reason.linkFr)) {
              uniqueLinks.add(item.reason.linkFr);
              html += `<div style="margin-left: 20px; margin-top: 4px; color: #000000;">&#128279; ${item.reason.linkFr}</div>`;
            }
          }
          html += `</li>`;
        }
      }
      html += `</ul>`;
    }

    if (additionalDocTasks.size > 0) {
      const dossierJobsFr = this.getDossierJobsSummaryTextFr();
      const generalAddDocs: { doc: any; docItems: any[] }[] = [];
      const occupSpecificDocs: { doc: any; docItems: any[] }[] = [];

      for (const [task, items] of additionalDocTasks.entries()) {
        const groupedItems = new Map<any, any[]>();
        for (const item of items) {
          if (!groupedItems.has(item.doc)) groupedItems.set(item.doc, []);
          groupedItems.get(item.doc).push(item);
        }
        for (const [doc, docItems] of groupedItems.entries()) {
          if (this.isSubsidizedDoc(doc) || this.isTaskBasedAdditionalDoc(doc)) {
            generalAddDocs.push({ doc, docItems });
          } else {
            occupSpecificDocs.push({ doc, docItems });
          }
        }
      }

      if (normalTasks.size > 0 || confirmationTasks.size > 0) {
        html += `<hr style="border: 0; border-top: 1px dashed #cbd5e1; margin: 25px 0;">`;
      }

      if (generalAddDocs.length > 0) {
        html += `<p style="margin-top: 15px;"><strong>Afin de compléter l'évaluation de votre demande d'emploi, nous aurons besoin de document(s) supplémentaire(s) :</strong></p>`;
        html += `<ul style="margin-top: 5px; list-style-type: disc; padding-left: 20px;">`;
        for (const { doc, docItems } of generalAddDocs) {
          html += `<li style="margin-bottom: 15px;"><span style="background-color: yellow; padding: 0 2px;"><strong><span style="color: #2563eb;">${doc.nameFr}</span></strong></span>`;
          const uniqueInstructions = new Set<string>();
          for (const item of docItems) {
            if (!uniqueInstructions.has(item.reason.instructionFr)) {
              uniqueInstructions.add(item.reason.instructionFr);
              html += `<div style="margin-left: 20px; margin-top: 4px; color: #000000;">&rarr; ${item.reason.instructionFr.replace(/\n/g, "<br>")}</div>`;
            }
          }
          const uniqueLinks = new Set<string>();
          for (const item of docItems) {
            if (item.reason.linkFr && !uniqueLinks.has(item.reason.linkFr)) {
              uniqueLinks.add(item.reason.linkFr);
              html += `<div style="margin-left: 20px; margin-top: 4px; color: #000000;">&#128279; ${item.reason.linkFr}</div>`;
            }
          }
          html += `</li>`;
        }
        html += `</ul>`;
      }

      const jobs = this.getDossierJobObjects();
      const jobDocsMapFr = new Map<JobEntry, string[]>();
      for (const job of jobs) {
        const reqs: string[] = [];
        for (const { doc, docItems } of occupSpecificDocs) {
          if (this.isAdditionalDocRequiredForJob(doc.nameFr, job.id)) {
            const isSelectedForJob = docItems.some((item: any) =>
              this.isJobReasonSelected(job, doc, item.reason)
            );
            if (isSelectedForJob) {
              const detail = this.getJobSpecificDocText(job.id, doc.nameFr, true);
              if (detail && !reqs.includes(detail)) {
                reqs.push(detail);
              }
            }
          }
        }
        if (reqs.length > 0) {
          jobDocsMapFr.set(job, reqs);
        }
      }

      if (jobDocsMapFr.size > 0) {
        const selectedJobsFr = Array.from(jobDocsMapFr.keys()).map(j => `${j.title} (${j.id})`).join(', ');
        const jobsHeaderTextFr = selectedJobsFr || dossierJobsFr;
        html += `<p style="margin-top: 15px; font-weight: bold; color: #000000;">Afin d'évaluer votre dossier pour le(s) métier(s) sélectionné(s) (${jobsHeaderTextFr}), vous devez nous fournir le(s) document(s) supplémentaire(s) suivant(s) ou une(des) preuve(s) que vous remplissez la(les) condition(s) suivante(s) en réponse directe à ce courriel :</p>`;
        html += `<ul style="margin-top: 5px; list-style-type: disc; padding-left: 20px;">`;
        for (const [job, reqs] of jobDocsMapFr.entries()) {
          html += `<li style="margin-bottom: 8px;"><strong>Pour ${job.id} - ${job.title} :</strong> <span style="background-color: yellow; padding: 0 2px;">` + reqs.join(", ") + `</span></li>`;
        }
        html += `</ul>`;
      }
    }
    html += `<!-- END_TASK_BODY_FR -->`;

    if (this.forceGeneralReminder()) {
      html += `<p>Veuillez également vous assurer de compléter les autres tâches manquantes sur votre portail.</p>`;
    }

    html += `<p><strong>Si vous ne prenez aucune action, votre dossier sera désactivé automatiquement après 30 jours.</strong></p>`;

    html += `<p>` + this.sharedState.getHtmlSignatureFr() + `</p>`;

    html += `<br><p>______________________________________________________________________________</p><br>`;

    // --- ENGLISH BLOCK ---
    html += `<p>Hello,</p>`;
    html += `<!-- START_TASK_BODY_EN -->`;

    if (normalTasks.size > 0) {
      html += `<p>We have evaluated your documents. While your application is progressing, some items are not compliant and require corrections on your part to allow us to continue processing.</p>`;
      html += `<p>The following tasks have been reassigned to you:</p>`;
      html += `<ul style="margin-top: 0; padding-left: 20px;">`;
      for (const [task, items] of normalTasks.entries()) {
        const taskNameEn = task.nameEn;
        html += `<li style="margin-bottom: 15px;"><span style="text-decoration: underline; font-weight: bold;">${taskNameEn}</span>`;
        html += `<ul style="margin-top: 5px; list-style-type: circle; padding-left: 20px;">`;
        if (this.taskNotCompletedKeys().has(task.nameFr)) {
          html += `<li style="margin-bottom: 10px;">`;
          html += `<span style="color: #FF0000; font-weight: bold;">You have not completed this task on your portal.</span>`;
          html += `<div style="margin-left: 20px; margin-top: 4px; color: #000000;">&rarr; Please log in to your portal and complete it.</div>`;
          html += `</li>`;
        }
        const groupedItems = new Map<any, any[]>();
        for (const item of items) {
          if (!groupedItems.has(item.doc)) groupedItems.set(item.doc, []);
          groupedItems.get(item.doc).push(item);
        }
        for (const [doc, docItems] of groupedItems.entries()) {
          const labels = docItems.map((i: any) => i.reason.labelEn);
          let labelsStr = "";
          if (labels.length === 1) {
            labelsStr = labels[0];
          } else if (labels.length === 2) {
            labelsStr = `${labels[0]} and ${labels[1]}`;
          } else {
            labelsStr = labels.slice(0, -1).join(', ') + ' and ' + labels[labels.length - 1];
          }
          
          html += `<li style="margin-bottom: 10px;">`;
          html += `<span style="background-color: yellow; padding: 0 2px;"><strong>${doc.nameEn} : <span style="color: #FF0000;">${labelsStr}</span></strong></span>`;
          
          const uniqueInstructions = new Set<string>();
          for (const item of docItems) {
            if (!uniqueInstructions.has(item.reason.instructionEn)) {
              uniqueInstructions.add(item.reason.instructionEn);
              html += `<div style="margin-left: 20px; margin-top: 4px; color: #000000;">&rarr; ${item.reason.instructionEn.replace(/\n/g, "<br>")}</div>`;
            }
          }
          const uniqueLinks = new Set<string>();
          for (const item of docItems) {
            if (item.reason.linkEn && !uniqueLinks.has(item.reason.linkEn)) {
              uniqueLinks.add(item.reason.linkEn);
              html += `<div style="margin-left: 20px; margin-top: 4px; color: #000000;">&#128279; ${item.reason.linkEn}</div>`;
            }
          }
          html += `</li>`;
        }
        html += `</ul></li>`;
      }
      html += `</ul>`;
      html += `<p>Due to the high volume of applications, we must prioritize the processing of files where all tasks are complete.</p>`;
      html += `<p>Please log in to your portal to complete them: <a href="https://www.cafoap-pclfac.forces.gc.ca/">https://www.cafoap-pclfac.forces.gc.ca/</a></p>`;
    }

    if (confirmationTasks.size > 0) {
      if (normalTasks.size > 0) {
        html += `<p>Furthermore, we require confirmation from you. Please reply directly to this email with the requested information for the following item:</p>`;
      } else {
        html += `<p>To continue processing your application, we require confirmation from you. Please reply directly to this email with the requested information for the following item:</p>`;
      }
      html += `<ul style="margin-top: 0; list-style-type: disc; padding-left: 20px;">`;
      for (const [task, items] of confirmationTasks.entries()) {
        const groupedItems = new Map<any, any[]>();
        for (const item of items) {
          if (!groupedItems.has(item.doc)) groupedItems.set(item.doc, []);
          groupedItems.get(item.doc).push(item);
        }
        for (const [doc, docItems] of groupedItems.entries()) {
          const labels = docItems.map((i: any) => i.reason.labelEn);
          let labelsStr = "";
          if (labels.length === 1) {
            labelsStr = labels[0];
          } else if (labels.length === 2) {
            labelsStr = `${labels[0]} and ${labels[1]}`;
          } else {
            labelsStr = labels.slice(0, -1).join(', ') + ' and ' + labels[labels.length - 1];
          }
          
          html += `<li style="margin-bottom: 15px;"><span style="background-color: yellow; padding: 0 2px;"><strong>${doc.nameEn} : <span style="color: #d97706;">${labelsStr}</span></strong></span>`;
          
          const uniqueInstructions = new Set<string>();
          for (const item of docItems) {
            if (!uniqueInstructions.has(item.reason.instructionEn)) {
              uniqueInstructions.add(item.reason.instructionEn);
              html += `<div style="margin-left: 20px; margin-top: 4px; color: #000000;">&rarr; ${item.reason.instructionEn.replace(/\n/g, "<br>")}</div>`;
            }
          }
          const uniqueLinks = new Set<string>();
          for (const item of docItems) {
            if (item.reason.linkEn && !uniqueLinks.has(item.reason.linkEn)) {
              uniqueLinks.add(item.reason.linkEn);
              html += `<div style="margin-left: 20px; margin-top: 4px; color: #000000;">&#128279; ${item.reason.linkEn}</div>`;
            }
          }
          html += `</li>`;
        }
      }
      html += `</ul>`;
    }

    if (additionalDocTasks.size > 0) {
      const dossierJobsEn = this.getDossierJobsSummaryTextEn();
      const generalAddDocs: { doc: any; docItems: any[] }[] = [];
      const occupSpecificDocs: { doc: any; docItems: any[] }[] = [];

      for (const [task, items] of additionalDocTasks.entries()) {
        const groupedItems = new Map<any, any[]>();
        for (const item of items) {
          if (!groupedItems.has(item.doc)) groupedItems.set(item.doc, []);
          groupedItems.get(item.doc).push(item);
        }
        for (const [doc, docItems] of groupedItems.entries()) {
          if (this.isSubsidizedDoc(doc) || this.isTaskBasedAdditionalDoc(doc)) {
            generalAddDocs.push({ doc, docItems });
          } else {
            occupSpecificDocs.push({ doc, docItems });
          }
        }
      }

      if (normalTasks.size > 0 || confirmationTasks.size > 0) {
        html += `<hr style="border: 0; border-top: 1px dashed #cbd5e1; margin: 25px 0;">`;
      }

      if (generalAddDocs.length > 0) {
        html += `<p style="margin-top: 15px;"><strong>In order to complete the evaluation of your employment application, we will need additional document(s):</strong></p>`;
        html += `<ul style="margin-top: 5px; list-style-type: disc; padding-left: 20px;">`;
        for (const { doc, docItems } of generalAddDocs) {
          html += `<li style="margin-bottom: 15px;"><span style="background-color: yellow; padding: 0 2px;"><strong><span style="color: #2563eb;">${doc.nameEn}</span></strong></span>`;
          const uniqueInstructions = new Set<string>();
          for (const item of docItems) {
            if (!uniqueInstructions.has(item.reason.instructionEn)) {
              uniqueInstructions.add(item.reason.instructionEn);
              html += `<div style="margin-left: 20px; margin-top: 4px; color: #000000;">&rarr; ${item.reason.instructionEn.replace(/\n/g, "<br>")}</div>`;
            }
          }
          const uniqueLinks = new Set<string>();
          for (const item of docItems) {
            if (item.reason.linkEn && !uniqueLinks.has(item.reason.linkEn)) {
              uniqueLinks.add(item.reason.linkEn);
              html += `<div style="margin-left: 20px; margin-top: 4px; color: #000000;">&#128279; ${item.reason.linkEn}</div>`;
            }
          }
          html += `</li>`;
        }
        html += `</ul>`;
      }

      const jobs = this.getDossierJobObjects();
      const jobDocsMapEn = new Map<JobEntry, string[]>();
      for (const job of jobs) {
        const reqs: string[] = [];
        for (const { doc, docItems } of occupSpecificDocs) {
          if (this.isAdditionalDocRequiredForJob(doc.nameFr, job.id)) {
            const isSelectedForJob = docItems.some((item: any) =>
              this.isJobReasonSelected(job, doc, item.reason)
            );
            if (isSelectedForJob) {
              const detail = this.getJobSpecificDocText(job.id, doc.nameFr, false);
              if (detail && !reqs.includes(detail)) {
                reqs.push(detail);
              }
            }
          }
        }
        if (reqs.length > 0) {
          jobDocsMapEn.set(job, reqs);
        }
      }

      if (jobDocsMapEn.size > 0) {
        const selectedJobsEn = Array.from(jobDocsMapEn.keys()).map(j => `${j.titleEn || j.title} (${j.id})`).join(', ');
        const jobsHeaderTextEn = selectedJobsEn || dossierJobsEn;
        html += `<p style="margin-top: 15px; font-weight: bold; color: #000000;">In order to evaluate your application for the selected occupation(s) (${jobsHeaderTextEn}), you must provide us with the following additional document(s) or proof that you meet the following condition(s) in direct reply to this email:</p>`;
        html += `<ul style="margin-top: 5px; list-style-type: disc; padding-left: 20px;">`;
        for (const [job, reqs] of jobDocsMapEn.entries()) {
          html += `<li style="margin-bottom: 8px;"><strong>For ${job.id} - ${job.titleEn || job.title} :</strong> <span style="background-color: yellow; padding: 0 2px;">` + reqs.join(", ") + `</span></li>`;
        }
        html += `</ul>`;
      }
    }
    html += `<!-- END_TASK_BODY_EN -->`;

    if (this.forceGeneralReminder()) {
      html += `<p>Please also ensure that you complete the other missing tasks on your portal.</p>`;
    }

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

      if (this.allTasksCompliant()) {
        htmlContent = this.getCompliantEmailHtml();
        textContent = this.getCompliantEmailPlain();
      } else if (this.sharedState.includeLinkedEmail() && this.sharedState.reoMergedEmailHtml()) {
        htmlContent = this.sharedState.reoMergedEmailHtml();
        textContent = this.sharedState.reoMergedEmailPlain();
      } else if (scenario) {
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
      await navigator.clipboard.writeText(this.displayedNote());
      this.copiedNote.set(true);
      setTimeout(() => this.copiedNote.set(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  }
}
