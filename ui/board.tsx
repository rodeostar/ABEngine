import { h, ComponentChildren } from "preact";
import { useGame } from "@/ui/provider.tsx";
import { tw } from "tw";
import classNames from "@/ui/classnames.ts";

const Tile = ({
  children,
  onClick,
  active = false,
}: {
  children?: ComponentChildren;
  onClick?: () => void;
  active?: boolean;
}) => {
  const highlight = tw`border-2 border-red-400`;
  const base = tw`bg-gray-400 h-full`;

  return (
    <div
      className={classNames(base, {
        [highlight]: active,
      })}
      onClick={() => (onClick ? onClick() : null)}
    >
      {children}
    </div>
  );
};

export const Shop = () => {
  const { player, setCoords, coords } = useGame();

  return (
    <div className={tw`grid grid-cols-5 gap-x-4 h-[32.5%] mb-[1%]`}>
      {(player?.shop || []).map((character, index) => (
        <Tile
          onClick={() => setCoords("shopIndex", index)}
          active={coords.shopIndex === index}
        >
          {character
            ? `${character.name} ${character.power}/${character.toughness}`
            : ""}
        </Tile>
      ))}
    </div>
  );
};

export default () => {
  const { player, setCoords, coords } = useGame();

  return (
    <div className={tw`grid grid-cols-5 gap-x-4 h-[32.5%] mb-[1%]`}>
      {(player?.board || []).map((character, index) => (
        <Tile
          onClick={() => setCoords("boardIndex", index)}
          active={coords.boardIndex === index}
        >
          {character
            ? `${character.name} ${character.power}/${character.toughness}`
            : ""}
        </Tile>
      ))}
    </div>
  );
};
