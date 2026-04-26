<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\ProjectExportController;
use App\Http\Controllers\TeamMemberController;
use Illuminate\Support\Facades\Route;

Route::get('login', [AuthController::class, 'showLogin'])->name('login');
Route::post('login', [AuthController::class, 'login']);
Route::post('logout', [AuthController::class, 'logout'])->name('logout');

Route::middleware('auth')->group(function () {
    Route::get('/', function () {
        return redirect()->route('dashboard');
    });

    Route::get('/dashboard', [ProjectController::class, 'index'])->name('dashboard');

    Route::prefix('projects')->name('projects.')->group(function () {
        Route::post('/', [ProjectController::class, 'store'])->name('store');
        Route::get('/{project}', [ProjectController::class, 'show'])->name('show');
        Route::post('/{project}/chat', [ProjectController::class, 'chat'])->name('chat');
        Route::post('/{project}/auto-assign', [ProjectController::class, 'autoAssignTasks'])->name('auto-assign');
        Route::get('/{project}/export/pdf', [ProjectExportController::class, 'exportPdf'])->name('export.pdf');
        Route::get('/{project}/export/excel', [ProjectExportController::class, 'exportExcel'])->name('export.excel');
    });

    Route::prefix('team-members')->name('team-members.')->group(function () {
        Route::get('/', [TeamMemberController::class, 'index'])->name('index');
        Route::post('/sync', [TeamMemberController::class, 'sync'])->name('sync');
        Route::get('/{teamMember}', [TeamMemberController::class, 'show'])->name('show');
        Route::put('/{teamMember}', [TeamMemberController::class, 'update'])->name('update');
        Route::delete('/{teamMember}', [TeamMemberController::class, 'destroy'])->name('destroy');
    });
});
