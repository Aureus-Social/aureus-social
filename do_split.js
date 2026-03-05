var fs = require('fs');
var path = require('path');
var src = fs.readFileSync('app/modules/SprintComponents.js', 'utf8');
var headerEnd = src.indexOf('export function');
var header = src.substring(0, headerEnd);

var re = /export function ([A-Za-z]+)/g;
var m, arr = [];
while ((m = re.exec(src)) !== null) { arr.push({ name: m[1], pos: m.index }); }

var groups = {
  DashboardGroup: ['TableauDirection','TableauBordDirection','CommandCenter','SmartAlerts','JournalActivite','AnalyticsDash'],
  PayrollGroup: ['GestionPrimes','EcheancierPaiements','Echeancier','PayrollTimeline','AutoIndexation','RegulPPAnnuelle','CalcJoursPrestes','RecapEmployeur','SimuOptiFiscale','ValidationEngine','BudgetPrev'],
  HRGroup: ['OnboardingWizard','PromesseEmbauche','WorkflowAbsences','CalendrierSocial','ContratGenerator','ConventionsCollectives','GestionVehicules','PortailEmploye','ChecklistClient'],
  DeclarationsGroup: ['ExportWinbooks','FacturationTarif','EnvoiMasse'],
  AdminGroup: ['AuthMultiRoles','AuditTrail','SecuriteData','RGPDManager','MonitoringSante','TestSuiteDash','ActionsRapides','ArchivesNumeriques'],
  AutomationGroup: ['PiloteAuto','SmartAutopilot','SmartAutomation','AutomationHub','MassEngine','ProcessingQueue','HistoriquePilote'],
  CommercialGroup: ['LandingPage','ComparatifConcurrents','ParserImportConcurrent','IntegrationsHub','PortalManager'],
  UtilsGroup: ['ComingSoon','SetupWizard','R','detectAgentLang']
};

function getCode(name) {
  for (var i = 0; i < arr.length; i++) {
    if (arr[i].name === name) {
      var start = arr[i].pos;
      var end = i < arr.length - 1 ? arr[i + 1].pos : src.length;
      return src.substring(start, end);
    }
  }
  return null;
}

// InviteTab is between the LAST non-exported function InviteTab and AuthMultiRoles
// We need to find it and include it ONLY ONCE in AdminGroup
var authPos = -1;
for (var i = 0; i < arr.length; i++) { if (arr[i].name === 'AuthMultiRoles') { authPos = arr[i].pos; break; } }

var inviteCode = '';
if (authPos !== -1) {
  // Search backwards from AuthMultiRoles for "function InviteTab("
  var searchArea = src.substring(0, authPos);
  var lastInvite = searchArea.lastIndexOf('function InviteTab(');
  if (lastInvite !== -1) {
    // InviteTab goes from lastInvite to authPos
    inviteCode = src.substring(lastInvite, authPos);
  }
}

function fixSyntax(code) {
  while (code.indexOf('?.6:') !== -1) code = code.replace('?.6:', '?0.6:');
  while (code.indexOf('{r.name} ? {r.desc}') !== -1) code = code.replace('{r.name} ? {r.desc}', '{r.name} - {r.desc}');
  return code;
}

var dir = 'app/modules';
var created = 0;
var allExports = [];
var keys = Object.keys(groups);

for (var g = 0; g < keys.length; g++) {
  var groupName = keys[g];
  var components = groups[groupName];
  var code = header;
  
  // For AdminGroup: AuthMultiRoles code already includes InviteTab inside its extraction
  // because InviteTab sits between the previous export and AuthMultiRoles.
  // So we must NOT add inviteCode separately - getCode('AuthMultiRoles') will get
  // code from AuthMultiRoles pos to next export. But InviteTab is BEFORE AuthMultiRoles.
  // We need a special extraction for AdminGroup.
  
  if (groupName === 'AdminGroup' && inviteCode) {
    // Add InviteTab before AuthMultiRoles
    code += fixSyntax(inviteCode) + '\n';
  }
  
  for (var j = 0; j < components.length; j++) {
    var c = getCode(components[j]);
    if (c) {
      code += fixSyntax(c);
      allExports.push({ name: components[j], file: groupName });
    } else {
      console.log('WARN: ' + components[j] + ' not found');
    }
  }
  
  var fp = path.join(dir, groupName + '.js');
  fs.writeFileSync(fp, code, 'utf8');
  console.log('Created ' + fp + ' (' + Math.round(code.length / 1024) + 'KB, ' + components.length + ' comps)');
  created++;
}

// Check: does AuthMultiRoles extraction already contain InviteTab?
var adminContent = fs.readFileSync(path.join(dir, 'AdminGroup.js'), 'utf8');
var inviteCount = (adminContent.match(/function InviteTab/g) || []).length;
if (inviteCount > 1) {
  console.log('WARNING: InviteTab duplicated (' + inviteCount + 'x) - removing duplicate...');
  // Remove the second occurrence
  var first = adminContent.indexOf('function InviteTab(');
  var second = adminContent.indexOf('function InviteTab(', first + 1);
  if (second !== -1) {
    // Find where second InviteTab ends (at next "export function")
    var nextExport = adminContent.indexOf('export function', second);
    if (nextExport !== -1) {
      adminContent = adminContent.substring(0, second) + adminContent.substring(nextExport);
    }
  }
  fs.writeFileSync(path.join(dir, 'AdminGroup.js'), adminContent, 'utf8');
  console.log('Duplicate removed.');
} else if (inviteCount === 0) {
  console.log('WARNING: InviteTab missing from AdminGroup!');
} else {
  console.log('InviteTab: OK (1 copy)');
}

// Re-export hub
var rex = '// AUREUS SOCIAL PRO - Sprint Components (Split)\n// Re-export hub\n\n';
for (var g = 0; g < keys.length; g++) {
  var gn = keys[g];
  var comps = groups[gn];
  var names = [];
  for (var j = 0; j < comps.length; j++) {
    for (var k = 0; k < allExports.length; k++) {
      if (allExports[k].name === comps[j]) { names.push(comps[j]); break; }
    }
  }
  if (names.length > 0) rex += 'export { ' + names.join(', ') + ' } from "./' + gn + '";\n';
}
fs.writeFileSync('app/modules/SprintComponents.js', rex, 'utf8');

// Final verification
console.log('\n=== VERIFICATION ===');
var allClean = true;
var allFiles = keys.map(function(k) { return k + '.js'; });
for (var i = 0; i < allFiles.length; i++) {
  var fp = path.join(dir, allFiles[i]);
  var fc = fs.readFileSync(fp, 'utf8');
  var issues = [];
  if (fc.indexOf('?.6:') !== -1) issues.push('opacity ?.6');
  if (fc.indexOf('{r.name} ? {r.desc}') !== -1) issues.push('ternaire JSX');
  var dupCount = (fc.match(/function InviteTab/g) || []).length;
  if (dupCount > 1) issues.push('InviteTab x' + dupCount);
  if (issues.length > 0) { console.log('FAIL ' + allFiles[i] + ': ' + issues.join(', ')); allClean = false; }
}
console.log(allClean ? 'ALL CLEAN - ' + created + ' files, ' + allExports.length + ' components' : 'ISSUES REMAIN');
