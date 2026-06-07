export interface ViaCepAddress {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
  erro?: boolean;
}

export interface FormattedAddress {
  cep: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
}

/**
 * Busca endereço pelo CEP usando API ViaCEP
 * @param cep - CEP formatado (apenas números ou com hífen)
 * @returns Promise com dados do endereço ou null se não encontrado
 */
export async function fetchAddressByCep(cep: string): Promise<FormattedAddress | null> {
  // Remove caracteres não numéricos
  const cleanCep = cep.replace(/\D/g, '');

  // Valida formato do CEP
  if (cleanCep.length !== 8) {
    return null;
  }

  try {
    const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
    const data: ViaCepAddress = await response.json();

    // Verifica se houve erro na API
    if (data.erro) {
      return null;
    }

    // Formata e retorna os dados
    return {
      cep: cleanCep,
      street: data.logradouro || '',
      number: '',
      complement: data.complemento || '',
      neighborhood: data.bairro || '',
      city: data.localidade || '',
      state: data.uf || '',
    };
  } catch (error) {
    console.error('Erro ao buscar CEP:', error);
    return null;
  }
}

/**
 * Formata CEP para exibição (00000-000)
 * @param cep - CEP (com ou sem formatação)
 * @returns CEP formatado
 */
export function formatCep(cep: string): string {
  const cleanCep = cep.replace(/\D/g, '');
  if (cleanCep.length !== 8) return cep;
  return `${cleanCep.slice(0, 5)}-${cleanCep.slice(5)}`;
}

/**
 * Valida formato do CEP
 * @param cep - CEP para validar
 * @returns true se válido
 */
export function isValidCep(cep: string): boolean {
  const cleanCep = cep.replace(/\D/g, '');
  return cleanCep.length === 8;
}
