interface FormErrorProps {
  id?: string;
  message?: string;
}

export default function FormError({ id, message }: FormErrorProps) {
  if (!message) return null;

  return (
    <p id={id} className="mt-1 text-sm text-red-600" aria-live="polite">
      {message}
    </p>
  );
}
