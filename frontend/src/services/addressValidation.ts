// Servicio para validación de direcciones usando Google Places API
// Nota: Necesitas una API key de Google Places para que funcione

interface AddressValidationResult {
  isValid: boolean;
  formattedAddress?: string;
  suggestions?: string[];
  error?: string;
}

class AddressValidationService {
  private apiKey: string;
  private baseUrl = 'https://maps.googleapis.com/maps/api/place';

  constructor() {
    // Obtener la API key desde las variables de entorno
    this.apiKey = process.env.REACT_APP_GOOGLE_PLACES_API_KEY || 'AIzaSyBhYe-8qPeldvRXYbg-E-_YqsuRZg_ahrI';
  }

  // Validar si una dirección existe usando Google Places API
  async validateAddress(address: string): Promise<AddressValidationResult> {
    if (!this.apiKey) {
      return {
        isValid: false,
        error: 'API key de Google Places no configurada'
      };
    }

    try {
      // Usar Places API para buscar la dirección
      const response = await fetch(
        `${this.baseUrl}/findplacefromtext/json?input=${encodeURIComponent(address)}&inputtype=textquery&fields=formatted_address,place_id&key=${this.apiKey}`
      );

      const data = await response.json();

      if (data.status === 'OK' && data.candidates && data.candidates.length > 0) {
        return {
          isValid: true,
          formattedAddress: data.candidates[0].formatted_address
        };
      } else if (data.status === 'ZERO_RESULTS') {
        return {
          isValid: false,
          error: 'Dirección no encontrada'
        };
      } else {
        return {
          isValid: false,
          error: `Error de API: ${data.status}`
        };
      }
    } catch (error) {
      return {
        isValid: false,
        error: 'Error al conectar con el servicio de validación'
      };
    }
  }

  // Obtener sugerencias de direcciones mientras el usuario escribe
  async getAddressSuggestions(input: string): Promise<string[]> {
    if (!this.apiKey || input.length < 3) {
      return [];
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/autocomplete/json?input=${encodeURIComponent(input)}&types=address&key=${this.apiKey}`
      );

      const data = await response.json();

      if (data.status === 'OK' && data.predictions) {
        return data.predictions.map((prediction: any) => prediction.description);
      }

      return [];
    } catch (error) {
      console.error('Error obteniendo sugerencias:', error);
      return [];
    }
  }

  // Validación local básica (fallback cuando no hay API key)
  validateAddressLocally(address: string): AddressValidationResult {
    // Validar que tenga al menos una calle y un número
    const addressParts = address.trim().split(/\s+/);
    
    if (addressParts.length < 2) {
      return {
        isValid: false,
        error: 'La dirección debe incluir nombre de calle y número'
      };
    }

    // Buscar un número en la dirección (3-5 dígitos)
    const numberPattern = /\b\d{3,5}\b/;
    const hasNumber = numberPattern.test(address);

    if (!hasNumber) {
      return {
        isValid: false,
        error: 'La dirección debe incluir un número de 3 a 5 dígitos'
      };
    }

    // Verificar que tenga al menos 10 caracteres
    if (address.length < 10) {
      return {
        isValid: false,
        error: 'La dirección debe tener al menos 10 caracteres'
      };
    }

    return {
      isValid: true
    };
  }

  // Método principal que usa validación local si no hay API key
  async validate(address: string): Promise<AddressValidationResult> {
    if (this.apiKey) {
      return this.validateAddress(address);
    } else {
      return this.validateAddressLocally(address);
    }
  }
}

const addressValidationService = new AddressValidationService();

export default {
  validateAddress: addressValidationService.validateAddress.bind(addressValidationService),
  getAddressSuggestions: addressValidationService.getAddressSuggestions.bind(addressValidationService),
  validate: addressValidationService.validateAddress.bind(addressValidationService)
}; 