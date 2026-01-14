import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing'; // 1. Necesario para los enlaces
import { MisExamenesComponent } from './mis-examenes.component'; // 2. Nombre corregido (añadido Component)

describe('MisExamenesComponent', () => {
  let component: MisExamenesComponent;
  let fixture: ComponentFixture<MisExamenesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      // Si tu componente es standalone (tiene standalone: true en el .ts):
      imports: [MisExamenesComponent, RouterTestingModule] 
      
      // NOTA: Si tu componente NO es standalone (lo usas en un módulo), 
      // mueve MisExamenesComponent a 'declarations' y deja RouterTestingModule en 'imports'.
    })
    .compileComponents();

    fixture = TestBed.createComponent(MisExamenesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});