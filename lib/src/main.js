"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const action_1 = require("./action");
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        let settings = {
            workingPath: core.getInput("workingPath", { required: true }),
            dockerFile: core.getInput("dockerFile", { required: true }),
            dockerRegistery: core.getInput("dockerRegistery", { required: true }),
            dockerUserName: core.getInput("dockerUserName", { required: true }),
            dockerPassword: core.getInput("dockerPassword", { required: true }),
            dockerImageName: core.getInput("dockerImageName", { required: true }),
            dockerTags: core.getInput("dockerTags", { required: true }).split(","),
            dockerSeedTags: core.getInput("dockerSeedTags", { required: true }).split(","),
        };
        let action = new action_1.Action(settings);
        yield action.run();
    });
}
run().catch(core.setFailed);
